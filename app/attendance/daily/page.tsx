'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { DailyAttendance, attendanceStatusLabels } from '@/types';
import { calculateWorkHours } from '@/utils/overtimeHelpers';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Calendar, CheckCircle2, XCircle, Clock, Zap } from 'lucide-react';

export default function DailyAttendancePage() {
    const { employees, dailyAttendance, addDailyAttendance, updateDailyAttendance } = useData();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

    const todayAttendance = dailyAttendance.filter(att => att.date === selectedDate);

    const handleCheckIn = (employeeId: string, employeeName: string) => {
        const existing = todayAttendance.find(att => att.employeeId === employeeId);

        if (existing) {
            alert('Sudah check-in hari ini!');
            return;
        }

        const checkInTime = new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        const newAttendance: DailyAttendance = {
            id: Date.now().toString(),
            employeeId,
            employeeName,
            date: selectedDate,
            checkIn: checkInTime,
            checkOut: null,
            status: 'checked_in',
            workHours: 0,
            regularHours: 0,
            overtimeHours: 0,
            createdAt: new Date().toISOString(),
        };

        addDailyAttendance(newAttendance);
        alert(`✅ Check-in berhasil untuk ${employeeName} pukul ${checkInTime}!`);
    };

    const handleCheckOut = (attendanceId: string) => {
        const attendance = dailyAttendance.find(a => a.id === attendanceId);
        if (!attendance || !attendance.checkIn) return;

        const checkOutTime = new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        const { workHours, regularHours, overtimeHours } = calculateWorkHours(
            attendance.checkIn,
            checkOutTime
        );

        updateDailyAttendance(attendanceId, {
            checkOut: checkOutTime,
            status: 'checked_out',
            workHours,
            regularHours,
            overtimeHours,
        });

        if (overtimeHours > 0) {
            alert(`✅ Check-out berhasil pukul ${checkOutTime}!\n⚡ Lembur: ${overtimeHours.toFixed(1)} jam`);
        } else {
            alert(`✅ Check-out berhasil pukul ${checkOutTime}!`);
        }
    };

    const activeEmployees = employees.filter(e => e.status === 'active');
    const checkedInCount = todayAttendance.filter(a => a.status !== 'not_checked_in').length;
    const notCheckedIn = activeEmployees.length - checkedInCount;
    const totalOvertimeToday = todayAttendance.reduce((sum, att) => sum + att.overtimeHours, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Absensi Harian</h1>
                <p className="text-gray-600 mt-1">Kelola kehadiran karyawan dengan tracking lembur</p>
            </div>

            {/* Date Selector */}
            <Card className="p-6">
                <div className="flex items-center gap-4">
                    <Calendar className="text-primary-600" size={24} />
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pilih Tanggal
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            max={new Date().toISOString().slice(0, 10)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Karyawan</p>
                            <p className="text-2xl font-bold text-gray-900">{activeEmployees.length}</p>
                        </div>
                        <Calendar className="text-primary-600" size={32} />
                    </div>
                </Card>

                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Sudah Hadir</p>
                            <p className="text-2xl font-bold text-success-600">{checkedInCount}</p>
                        </div>
                        <CheckCircle2 className="text-success-600" size={32} />
                    </div>
                </Card>

                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Belum Hadir</p>
                            <p className="text-2xl font-bold text-danger-600">{notCheckedIn}</p>
                        </div>
                        <XCircle className="text-danger-600" size={32} />
                    </div>
                </Card>

                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Lembur</p>
                            <p className="text-2xl font-bold text-warning-orange-600">
                                {totalOvertimeToday.toFixed(1)} jam
                            </p>
                        </div>
                        <Zap className="text-warning-orange-600" size={32} />
                    </div>
                </Card>
            </div>

            {/* Attendance List */}
            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Daftar Kehadiran - {new Date(selectedDate).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Karyawan</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Check-In</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Check-Out</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Jam Kerja</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Lembur</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {activeEmployees.map(employee => {
                                    const attendance = todayAttendance.find(att => att.employeeId === employee.id);

                                    return (
                                        <tr key={employee.id} className="hover:bg-gray-50 smooth-transition">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900">{employee.name}</p>
                                                <p className="text-sm text-gray-500">{employee.employeeId}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                {attendance?.checkIn ? (
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="text-success-600" size={16} />
                                                        <span className="text-sm text-gray-900">
                                                            {attendance.checkIn}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {attendance?.checkOut ? (
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="text-primary-600" size={16} />
                                                        <span className="text-sm text-gray-900">
                                                            {attendance.checkOut}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {attendance?.workHours ? (
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {attendance.workHours.toFixed(1)} jam
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {attendance?.overtimeHours ? (
                                                    <div className="flex items-center gap-1">
                                                        <Zap className="text-warning-orange-600" size={14} />
                                                        <span className="text-sm font-bold text-warning-orange-600">
                                                            {attendance.overtimeHours.toFixed(1)} jam
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {attendance ? (
                                                    <Badge variant={attendance.status === 'checked_out' ? 'success' : 'default'}>
                                                        {attendanceStatusLabels[attendance.status]}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="danger">Belum Check-in</Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {selectedDate === new Date().toISOString().slice(0, 10) && (
                                                    <div className="flex gap-2">
                                                        {!attendance ? (
                                                            <Button
                                                                size="sm"
                                                                variant="primary"
                                                                onClick={() => handleCheckIn(employee.id, employee.name)}
                                                            >
                                                                Check-In
                                                            </Button>
                                                        ) : attendance.status === 'checked_in' ? (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleCheckOut(attendance.id)}
                                                            >
                                                                Check-Out
                                                            </Button>
                                                        ) : (
                                                            <Badge variant="success">Selesai</Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Card>
        </div>
    );
}
