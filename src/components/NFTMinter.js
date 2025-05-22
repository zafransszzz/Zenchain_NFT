import { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import '../App.css';
const CONTRACT_ADDRESS = '0xbE00c6F9A4941eBb4cE88cd81929F49bbaF0e26B';
const NFT_STORAGE_API_KEY = '274f0a4a.b605deaf016548d7be867afb618399ae';

const ABI = [
  "function mintNFT(address to, string memory tokenURI) public returns (uint256)"
];

export default function NFTMinter() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadToNFTStorage = async () => {
    if (!file) return;
    setLoading(true);
    setStatus('Uploading to IPFS...');

    const formData = new FormData();
    formData.append('file', file);

    const imageRes = await axios.post('https://api.nft.storage/upload', formData, {
      headers: {
        Authorization: `Bearer ${NFT_STORAGE_API_KEY}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    const imageCid = imageRes.data.value.cid;
    const imageURI = `ipfs://${imageCid}`;

    const metadata = {
      name: "Zen NFT #1",
      description: "NFT pertama yang dicetak di ZenChain Testnet.",
      image: imageURI
    };

    const metadataRes = await axios.post(
      'https://api.nft.storage/upload',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
      {
        headers: {
          Authorization: `Bearer ${NFT_STORAGE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const metadataCid = metadataRes.data.value.cid;
    return `ipfs://${metadataCid}`;
  };

  const mintNFT = async () => {
    try {
      const tokenURI = await uploadToNFTStorage();
      setStatus('Menyambungkan wallet...');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      setStatus('Sedang mint NFT...');
      const tx = await contract.mintNFT(await signer.getAddress(), tokenURI);
      await tx.wait();

      setStatus('NFT berhasil dimint!');
    } catch (err) {
      console.error(err);
      setStatus('Gagal mint NFT.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-xl w-full space-y-6 transition-all duration-300 hover:scale-[1.02]">
      <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-2">Zen-Launchpaad</h1>
      <p className="text-center text-gray-500 mb-4">Mint NFT ke ZenChain Testnet</p>

      <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-700 cursor-pointer"
        />
        {file && (
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="mt-4 mx-auto max-h-64 rounded-lg object-cover shadow-md transition-transform hover:scale-105"
          />
        )}
      </div>

      <button
        onClick={mintNFT}
        disabled={loading}
        className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-medium py-3 rounded-xl transition duration-300 shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Memproses...' : 'Mint NFT Sekarang'}
      </button>

      {status && (
        <p className="text-center text-sm text-gray-600">{status}</p>
      )}
    </div>
  );
}
