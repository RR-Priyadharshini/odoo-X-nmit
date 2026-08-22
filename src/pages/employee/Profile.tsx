import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Briefcase, Calendar, Mail, Shield, Save, Camera } from 'lucide-react';
import { authApi, employeesApi } from '../../api/index.js';
import { Employee, User as UserType } from '../../types.js';
import { useToast } from '../../context/ToastContext.js';
import { formatDate, getInitials } from '../../utils/formatters.js';

export const Profile: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    profile_picture: ''
  });

  const { success, error } = useToast();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await authApi.getMe();
      setUser(res.user);
      setEmployee(res.employee);
      if (res.employee) {
        setFormData({
          phone: res.employee.phone || '',
          address: res.employee.address || '',
          profile_picture: res.employee.profile_picture || ''
        });
      }
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    try {
      setSaving(true);
      await employeesApi.update(employee.id, formData);
      success('Your contact & personal profile has been updated.', 'Profile Saved');
      await fetchProfile();
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold uppercase tracking-wider">Loading Profile Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Member Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your official workforce records and manage your contact details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 text-center space-y-4">
          <div className="relative inline-block">
            {formData.profile_picture ? (
              <img
                src={formData.profile_picture}
                alt={user?.name}
                referrerPolicy="no-referrer"
                className="w-28 h-28 rounded-3xl object-cover border-4 border-slate-100 shadow-md mx-auto"
              />
            ) : (
              <div className="w-28 h-28 rounded-3xl bg-slate-900 text-white font-bold text-2xl flex items-center justify-center shadow-md mx-auto">
                {user ? getInitials(user.name) : 'DF'}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{employee?.designation}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
              <span>{user?.employee_code}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-left space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Department:</span>
              <strong className="text-slate-900">{employee?.department}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Joined Dayflow:</span>
              <strong className="text-slate-900">{formatDate(employee?.joining_date)}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Account Role:</span>
              <strong className="text-slate-900 capitalize">{user?.role}</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Contact Form + Read-only Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Personal & Contact Info</h3>
                <p className="text-xs text-slate-500">You may update your phone, address, and profile picture</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Official Email (Read-only)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Residential Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Indiranagar, Bengaluru, Karnataka"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Profile Picture URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Camera className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={formData.profile_picture}
                    onChange={(e) => setFormData({ ...formData, profile_picture: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
