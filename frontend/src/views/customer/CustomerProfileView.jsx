import React, { useState } from 'react';
import {
  User,
  Tractor,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Sprout,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CustomerProfileView = () => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  const [farmData, setFarmData] = useState({
    name: user?.name || 'Ramesh Kumar',
    phone: user?.phone || '+91 94432 11029',
    email: user?.email || 'ramesh.farmer@gmail.com',
    farmName: user?.farmDetails?.farmName || 'Aliyar Green Valley Farm',
    acreage: user?.farmDetails?.acreage || 15,
    primaryCrop: user?.farmDetails?.primaryCrop || 'Sugarcane & Paddy',
    address: user?.address || '12 Temple Street, Aliyar Valley',
    city: user?.city || 'Pollachi',
  });

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1f1d19]">Farmer & Agro Profile</h1>
        <p className="text-xs text-[#7e786d] mt-0.5">
          Manage your farm holdings, preferred crops, and delivery addresses
        </p>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Farm profile saved successfully!</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-[#ece8df] p-7 shadow-2xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-[#f2efe8]">
          <div className="w-16 h-16 rounded-3xl bg-amber-500 text-[#141412] flex items-center justify-center font-extrabold text-2xl shadow-sm">
            {farmData.name[0] || 'R'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1f1d19]">{farmData.name}</h2>
            <p className="text-xs text-[#7e786d] mt-0.5">
              Verified Farmer Member • Direct Farm Dispatch Eligible
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#524e45] font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={farmData.name}
                onChange={(e) => setFarmData({ ...farmData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#524e45] font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={farmData.phone}
                onChange={(e) => setFarmData({ ...farmData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#524e45] font-semibold mb-1">Farm Name</label>
              <input
                type="text"
                value={farmData.farmName}
                onChange={(e) => setFarmData({ ...farmData, farmName: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#524e45] font-semibold mb-1">Total Acreage</label>
              <input
                type="number"
                value={farmData.acreage}
                onChange={(e) => setFarmData({ ...farmData, acreage: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#524e45] font-semibold mb-1">Primary Crops Grown</label>
              <input
                type="text"
                value={farmData.primaryCrop}
                onChange={(e) => setFarmData({ ...farmData, primaryCrop: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#524e45] font-semibold mb-1">City / Taluk</label>
              <input
                type="text"
                value={farmData.city}
                onChange={(e) => setFarmData({ ...farmData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[#524e45] font-semibold mb-1">Farm Delivery Address</label>
              <input
                type="text"
                value={farmData.address}
                onChange={(e) => setFarmData({ ...farmData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#f2efe8] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#f59e0b] hover:bg-[#ea9307] text-[#1a1813] font-bold rounded-xl shadow-xs"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
