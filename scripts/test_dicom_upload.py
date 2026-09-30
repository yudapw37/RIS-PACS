import sys
import os
import datetime
import urllib.request
import pydicom
from pydicom.dataset import Dataset, FileDataset
from pydicom.uid import ExplicitVRLittleEndian, SecondaryCaptureImageStorage, generate_uid
import numpy as np

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def create_and_upload_dicom(patient_mrn, patient_name, accession_number, modality="DX", body_part="Thorax PA"):
    sop_uid = generate_uid()
    study_uid = generate_uid()
    series_uid = generate_uid()

    file_meta = Dataset()
    file_meta.MediaStorageSOPClassUID = SecondaryCaptureImageStorage
    file_meta.MediaStorageSOPInstanceUID = sop_uid
    file_meta.TransferSyntaxUID = ExplicitVRLittleEndian
    file_meta.ImplementationClassUID = "1.2.840.10008.5.1.4.1.1.1"

    filepath = os.path.join("scripts", f"sample_{accession_number}.dcm")
    ds = FileDataset(filepath, {}, file_meta=file_meta, preamble=b"\0" * 128)

    ds.PatientName = patient_name.replace(" ", "^")
    ds.PatientID = patient_mrn
    ds.AccessionNumber = accession_number
    ds.Modality = modality
    ds.StudyDescription = body_part
    ds.SeriesDescription = f"{body_part} View"
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
    print(f"✅ DICOM File dibuat: {filepath} ({file_size} bytes)")
    print(f"   - Patient       : {ds.PatientName} ({ds.PatientID})")
    print(f"   - Accession     : {ds.AccessionNumber}")
    print(f"   - Study UID     : {ds.StudyInstanceUID}")
    print(f"   - Modality      : {ds.Modality} / {ds.StudyDescription}")

    # Upload via STOW-RS to DCM4CHEE
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
            print(f"🚀 STOW-RS DCM4CHEE Response: HTTP {resp.status}")
            resp_body = resp.read().decode("utf-8", errors="ignore")
            print(f"   Upload berhasil! Citra DICOM tersimpan di PACS DCM4CHEE.")
            return {
                "success": True,
                "studyInstanceUid": study_uid,
                "seriesInstanceUid": series_uid,
                "sopInstanceUid": sop_uid,
                "filepath": filepath
            }
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="ignore")
        print(f"❌ Gagal STOW-RS DCM4CHEE (HTTP {e.code}): {err_msg[:300]}")
        return {"success": False, "error": err_msg}
    except Exception as e:
        print(f"❌ Error upload: {e}")
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    create_and_upload_dicom(
        patient_mrn="RM-STG-DICOM-01",
        patient_name="Bpk. Hendra Pratama",
        accession_number="ACC-TEST-DCM-99",
        modality="DX",
        body_part="Thorax PA"
    )
