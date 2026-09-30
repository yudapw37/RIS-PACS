import sys
import os
import argparse
import json
import datetime
import urllib.request
import pydicom
from pydicom.dataset import Dataset, FileDataset
from pydicom.uid import ExplicitVRLittleEndian, SecondaryCaptureImageStorage, generate_uid
import numpy as np

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def create_and_upload_dicom(patient_mrn: str, patient_name: str, accession_number: str, modality: str = "DX", body_part: str = "Thorax PA"):
    sop_uid = generate_uid()
    study_uid = generate_uid()
    series_uid = generate_uid()

    file_meta = Dataset()
    file_meta.MediaStorageSOPClassUID = SecondaryCaptureImageStorage
    file_meta.MediaStorageSOPInstanceUID = sop_uid
    file_meta.TransferSyntaxUID = ExplicitVRLittleEndian
    file_meta.ImplementationClassUID = "1.2.840.10008.5.1.4.1.1.1"

    out_dir = os.path.join(os.path.dirname(__file__), "dicom_samples")
    os.makedirs(out_dir, exist_ok=True)
    filepath = os.path.join(out_dir, f"{accession_number}.dcm")

    ds = FileDataset(filepath, {}, file_meta=file_meta, preamble=b"\0" * 128)

    clean_name = patient_name.replace(" ", "^")
    ds.PatientName = clean_name
    ds.PatientID = patient_mrn
    ds.AccessionNumber = accession_number
    ds.Modality = modality
    ds.StudyDescription = body_part
    ds.SeriesDescription = f"{body_part} Standard View"
    ds.StudyInstanceUID = study_uid
    ds.SeriesInstanceUID = series_uid
    ds.SOPInstanceUID = sop_uid
    ds.SOPClassUID = SecondaryCaptureImageStorage

    dt = datetime.datetime.now()
    ds.StudyDate = dt.strftime("%Y%m%d")
    ds.StudyTime = dt.strftime("%H%M%S")
    ds.SeriesDate = ds.StudyDate
    ds.SeriesTime = ds.StudyTime
    ds.InstanceNumber = 1

    # Synthetic realistic gradient image (512x512)
    x = np.linspace(-3, 3, 512)
    y = np.linspace(-3, 3, 512)
    xx, yy = np.meshgrid(x, y)
    z = np.exp(-(xx**2 + yy**2) / 4) * 4000 + 1000
    pixels = z.astype(np.uint16)

    ds.Rows = 512
    ds.Columns = 512
    ds.BitsAllocated = 16
    ds.BitsStored = 16
    ds.HighBit = 15
    ds.PixelRepresentation = 0
    ds.SamplesPerPixel = 1
    ds.PhotometricInterpretation = "MONOCHROME2"
    ds.PixelData = pixels.tobytes()

    ds.save_as(filepath)
    file_size = os.path.getsize(filepath)

    # Upload via STOW-RS to DCM4CHEE PACS
    boundary = "------DCMBoundary7MA4YWxkTrZu0gW"
    with open(filepath, "rb") as f:
        dicom_bytes = f.read()

    body = bytearray()
    body.extend(f"--{boundary}\r\n".encode())
    body.extend(b"Content-Type: application/dicom\r\n\r\n")
    body.extend(dicom_bytes)
    body.extend(f"\r\n--{boundary}--\r\n".encode())

    req = urllib.request.Request(
        "http://localhost:8082/dcm4chee-arc/aets/DCM4CHEE/rs/studies",
        data=bytes(body),
        headers={
            "Content-Type": f'multipart/related; type="application/dicom"; boundary="{boundary}"'
        }
    )

    try:
        with urllib.request.urlopen(req) as resp:
            resp_body = resp.read().decode("utf-8", errors="ignore")
            result = {
                "success": True,
                "httpStatus": resp.status,
                "studyInstanceUid": study_uid,
                "seriesInstanceUid": series_uid,
                "sopInstanceUid": sop_uid,
                "filepath": filepath,
                "fileSize": file_size,
                "patientMrn": patient_mrn,
                "patientName": patient_name,
                "accessionNumber": accession_number,
                "modality": modality,
                "bodyPart": body_part
            }
            print(json.dumps(result))
            return result
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="ignore")
        result = {"success": False, "httpStatus": e.code, "error": err_msg}
        print(json.dumps(result))
        return result
    except Exception as e:
        result = {"success": False, "error": str(e)}
        print(json.dumps(result))
        return result

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create & upload synthetic DICOM to DCM4CHEE")
    parser.add_argument("--mrn", required=True, help="Patient MRN / ID")
    parser.add_argument("--name", required=True, help="Patient Full Name")
    parser.add_argument("--accession", required=True, help="Accession Number")
    parser.add_argument("--modality", default="DX", help="Modality (DX, CT, MR, etc.)")
    parser.add_argument("--body-part", default="Thorax PA", help="Study Description / Body Part")

    args = parser.parse_args()
    create_and_upload_dicom(
        patient_mrn=args.mrn,
        patient_name=args.name,
        accession_number=args.accession,
        modality=args.modality,
        body_part=args.body_part
    )
