import React from 'react';
import { useFactory } from '../../context/FactoryContext';

interface PrintHeaderProps {
  title: string;
  subtitle?: string;
  documentNo?: string;
  date?: string;
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({ title, subtitle, documentNo, date }) => {
  const { settings } = useFactory();

  return (
    <div className="border-b-2 border-gray-900 pb-3 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-900">
            {settings.factoryName || 'FACTORY RECORD SYSTEM'}
          </h1>
          {settings.tagline && <p className="text-xs text-gray-600 font-medium">{settings.tagline}</p>}
          {(settings.address || settings.phone) && (
            <p className="text-xs text-gray-600 mt-1">
              {settings.address} {settings.phone && `| Tel: ${settings.phone}`}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="inline-block border border-gray-800 px-3 py-1 bg-gray-50 rounded text-center">
            <span className="text-sm font-bold uppercase tracking-wider block text-gray-900">{title}</span>
            {documentNo && <span className="text-xs font-mono font-semibold text-gray-700">No: {documentNo}</span>}
          </div>
          {date && <p className="text-xs text-gray-700 mt-1 font-medium">Date: {date}</p>}
        </div>
      </div>
      {subtitle && <p className="text-xs text-gray-500 italic mt-1">{subtitle}</p>}
    </div>
  );
};
