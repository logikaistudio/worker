'use client';

import React from 'react';
import { useData } from '@/context/DataContext';

const Notifications: React.FC = () => {
  const { certificateAlerts, dismissAlert } = useData();

  if (!certificateAlerts || certificateAlerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 w-96 z-50">
      <div className="bg-white shadow-lg rounded border overflow-hidden">
        <div className="px-4 py-2 border-b flex items-center justify-between">
          <h4 className="font-semibold">Notifikasi</h4>
          <span className="text-sm text-gray-500">{certificateAlerts.length} item(s)</span>
        </div>
        <div className="max-h-64 overflow-auto">
          {certificateAlerts.map((a) => (
            <div key={a.id} className="px-4 py-3 border-b last:border-b-0 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{a.certificateName}</div>
                <div className="text-xs text-gray-600">{a.employeeName} — exp: {a.expiryDate ? new Date(a.expiryDate).toLocaleDateString('id-ID') : 'tidak ada'}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => dismissAlert(a.id)} className="text-xs text-red-600 hover:underline">Tandai selesai</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
