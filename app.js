// =========================================================
// MASUKKAN ALAMAT KONTRAK HASIL DEPLOY DI MONAD TESTNET KAMU
// =========================================================
const CONTRACT_ADDRESSES = {
    LandRegistry: "0x9DF5764517ACD49F4BEDCe02623d618BACDb5F3D",
    RevenueFunding: "0x9df5764517acd49f4bedce02623d618bacdb5f3d",
    VirtualLand: "0x9df5764517acd49f4bedce02623d618bacdb5f3d"
};

// ABI Minimal untuk Komunikasi Web3
const LAND_REGISTRY_ABI = [
    "function registerAsset(string locationData, uint256 areaInSqMeters, bytes32 documentHash) external returns (uint256)",
    "function getAsset(uint256 assetId) external view returns (tuple(uint256 id, address owner, string locationData, uint256 areaInSqMeters, bytes32 documentHash, uint8 status, uint256 registeredAt, uint256 updatedAt))"
];

const REVENUE_FUNDING_ABI = [
    "function createBusinessProject(uint256 assetId, string businessName, uint256 targetFunding, uint256 projectedRevenue, uint256 projectedExpenses, uint256 sharePercentage) external returns (uint256)"
];

const VIRTUAL_LAND_ABI = [
    "function mintVirtualLand(address to, string coordinates) external returns (uint256)"
];

let provider;
let signer;
let userAddress;

// 1. HUBUNGKAN METAMASK
async function connectWallet() {
    if (!window.ethereum) return alert("MetaMask belum terpasang di browser kamu!");
    try {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        userAddress = await signer.getAddress();

        document.getElementById("walletAddress").innerText = `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
        document.getElementById("connectBtn").innerText = "Wallet Terhubung";
        alert("Wallet terhubung!");
    } catch (err) {
        console.error("Gagal koneksi wallet:", err);
    }
}

// 2. REGISTRASI ASET TANAH (RWA)
async function registerLandAsset() {
    if (!signer) return alert("Hubungkan MetaMask terlebih dahulu!");

    const loc = document.getElementById("regLocation").value;
    const area = document.getElementById("regArea").value;
    let docHashInput = document.getElementById("regHash").value;

    if (!loc || !area || !docHashInput) return alert("Harap isi semua kolom!");

    // Konversi teks biasa ke bytes32 jika format bukan hex
    let docHash = docHashInput.startsWith("0x") && docHashInput.length === 66 
        ? docHashInput 
        : ethers.keccak256(ethers.toUtf8Bytes(docHashInput));

    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESSES.LandRegistry, LAND_REGISTRY_ABI, signer);
        const tx = await contract.registerAsset(loc, area, docHash);
        alert("Transaksi dikirim! Menunggu blok konfirmasi di Monad Testnet...");
        await tx.wait();
        alert("Aset Tanah Berhasil Didaftarkan di Blockchain!");
    } catch (err) {
        console.error(err);
        alert("Gagal mendaftarkan aset: " + (err.reason || err.message));
    }
}

// 3. CEK DETAIL ASET TANAH
async function getLandAssetDetails() {
    if (!provider) return alert("Hubungkan MetaMask terlebih dahulu!");
    const assetId = document.getElementById("searchAssetId").value;
    if (!assetId) return alert("Masukkan ID Aset terlebih dahulu!");

    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESSES.LandRegistry, LAND_REGISTRY_ABI, provider);
        const asset = await contract.getAsset(assetId);

        const statusMap = ["Pending (Menunggu Verifikasi)", "Verified (Terverifikasi)", "Rejected (Ditolak)", "Revoked (Dicabut)"];

        document.getElementById("landDetails").innerText = 
            `ID Aset        : ${asset.id}\n` +
            `Pemilik        : ${asset.owner}\n` +
            `Lokasi         : ${asset.locationData}\n` +
            `Luas           : ${asset.areaInSqMeters} m²\n` +
            `Document Hash  : ${asset.documentHash}\n` +
            `Status         : ${statusMap[asset.status]}`;
    } catch (err) {
        console.error(err);
        document.getElementById("landDetails").innerText = "Data aset tidak ditemukan atau ID tidak valid.";
    }
}

// 4. BUAT PROYEK SIMULASI BISNIS
async function createBusinessProject() {
    if (!signer) return alert("Hubungkan MetaMask terlebih dahulu!");

    const assetId = document.getElementById("projAssetId").value;
    const name = document.getElementById("projName").value;
    const target = document.getElementById("projTarget").value;
    const rev = document.getElementById("projRev").value;
    const exp = document.getElementById("projExp").value;
    const share = document.getElementById("projShare").value;

    if (!assetId || !name || !target || !rev || !exp || !share) return alert("Isi semua formulir proyek!");

    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESSES.RevenueFunding, REVENUE_FUNDING_ABI, signer);
        const tx = await contract.createBusinessProject(assetId, name, target, rev, exp, share);
        alert("Mengirim proyek simulasi ke Monad Testnet...");
        await tx.wait();
        alert("Proyek Simulasi Bisnis Berhasil Dibuat!");
    } catch (err) {
        console.error(err);
        alert("Gagal membuat proyek: " + (err.reason || err.message));
    }
}

// 5. MINT VIRTUAL LAND (GAMEFI)
async function mintVirtualLandNFT() {
    if (!signer) return alert("Hubungkan MetaMask terlebih dahulu!");
    const coords = document.getElementById("virtualCoords").value;
    if (!coords) return alert("Masukkan koordinat terlebih dahulu!");

    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESSES.VirtualLand, VIRTUAL_LAND_ABI, signer);
        const tx = await contract.mintVirtualLand(userAddress, coords);
        alert("Minting Virtual Land NFT sedang diproses...");
        await tx.wait();
        document.getElementById("virtualDetails").innerText = `🎉 Berhasil! NFT Lahan Virtual pada koordinat [${coords}] telah di-mint ke wallet kamu (${userAddress}).`;
    } catch (err) {
        console.error(err);
        alert("Gagal mint Virtual Land: " + (err.reason || err.message));
    }
}