'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface EditableDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    onAddOption: (option: string) => void;
    onRemoveOption: (option: string) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
}

const EditableDropdown: React.FC<EditableDropdownProps> = ({
    value,
    onChange,
    options,
    onAddOption,
    onRemoveOption,
    placeholder = 'Pilih atau tambah baru',
    label,
    required = false,
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newOption, setNewOption] = useState('');

    const handleAdd = () => {
        if (newOption.trim()) {
            onAddOption(newOption.trim());
            onChange(newOption.trim());
            setNewOption('');
            setIsAdding(false);
        }
    };

    const handleRemove = (option: string) => {
        if (confirm(`Hapus "${option}" dari daftar?`)) {
            onRemoveOption(option);
            if (value === option) {
                onChange('');
            }
        }
    };

    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label} {required && <span className="text-danger-600">*</span>}
                </label>
            )}

            {!isAdding ? (
                <div className="flex gap-2">
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        required={required}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value="">{placeholder}</option>
                        {options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={() => setIsAdding(true)}
                        className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 smooth-transition"
                        title="Tambah baru"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                        placeholder="Ketik opsi baru..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        autoFocus
                    />
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="px-3 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 smooth-transition"
                        title="Simpan"
                    >
                        <Plus size={20} />
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setIsAdding(false);
                            setNewOption('');
                        }}
                        className="px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 smooth-transition"
                        title="Batal"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}

            {/* Show remove buttons for existing options */}
            {value && options.includes(value) && options.length > 1 && (
                <button
                    type="button"
                    onClick={() => handleRemove(value)}
                    className="mt-2 text-xs text-danger-600 hover:text-danger-700"
                >
                    Hapus "{value}" dari daftar
                </button>
            )}
        </div>
    );
};

export default EditableDropdown;
