#!/bin/bash
# ================================================================
# SmartRIS V3 - Git-Based Deploy Script untuk Proxmox Server
# PACS: DCM4CHEE Arc Light 5
# 
# PERTAMA KALI:
#   git clone https://github.com/yudapw37/RIS-PACS.git /opt/SmartRIS_V3
#   cd /opt/SmartRIS_V3
#   cp .env.production.example .env.production
#   nano .env.production   # <-- Sesuaikan IP, Password, dll
#   chmod +x deploy.sh
#   ./deploy.sh
#
# UPDATE BERIKUTNYA:
#   cd /opt/SmartRIS_V3
#   ./deploy.sh
# ================================================================

set -e

echo "🏥 ================================================="
echo "   SmartRIS V3 - Production Deploy (DCM4CHEE PACS)"
echo "   $(date)"
echo "🏥 ================================================="
echo ""

# 1. Cek file .env.production
if [ ! -f ".env.production" ]; then
    echo "❌ File .env.production tidak ditemukan!"
    echo ""
    echo "   Langkah pertama kali deploy:"
    echo "   cp .env.production.example .env.production"
    echo "   nano .env.production"
    echo ""
    echo "   Lalu jalankan ulang: ./deploy.sh"
    exit 1
fi

# 2. Pull update terbaru dari Git
echo "📥 Step 1: Pulling latest code from Git..."
git pull origin main
echo ""

# 3. Build semua Docker images
echo "📦 Step 2: Building all Docker images..."
docker compose -f docker-compose.prod.yml --env-file .env.production build --no-cache
echo ""

# 4. Restart semua services
echo "🚀 Step 3: Starting all services..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
echo ""

# 5. Tunggu services siap (DCM4CHEE butuh waktu lebih lama untuk boot Wildfly)
echo "⏳ Step 4: Waiting for services to be ready (DCM4CHEE needs ~30s)..."
sleep 30

# 6. Status
echo "📊 Step 5: Checking service status..."
docker compose -f docker-compose.prod.yml --env-file .env.production ps
echo ""

# 7. Info
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "✅ ================================================="
echo "   SmartRIS V3 berhasil di-deploy!"
echo "   "
echo "   🌐 Frontend (Vue):     http://${SERVER_IP}:8080"
echo "   🔌 Backend API:        http://${SERVER_IP}:3000"
echo "   🏥 DCM4CHEE UI:        http://${SERVER_IP}:8082/dcm4chee-arc/ui2"
echo "   📡 DCM4CHEE DICOM:     ${SERVER_IP}:11112 (AET: DCM4CHEE)"
echo "   📨 DCM4CHEE HL7:       ${SERVER_IP}:2575"
echo "   🖥️  OHIF Viewer:        http://${SERVER_IP}:3001"
echo "   🗄️  MySQL:              ${SERVER_IP}:33060"
echo "   "
echo "   Logs:  docker compose -f docker-compose.prod.yml logs -f"
echo "   Stop:  docker compose -f docker-compose.prod.yml down"
echo "✅ ================================================="
