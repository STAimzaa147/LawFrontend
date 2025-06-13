'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getSession } from 'next-auth/react';

export default function UserProfile() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [user, setUser] = useState({
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    thaiId: '',
    lineId: '',
    district: '',
    province: '',
    image: '',
  });

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);


  useEffect(() => {
  const fetchUser = async () => {
    try {
      const session = await getSession();

      console.log('NextAuth Session:', session);

      
      const token = session?.accessToken;
      if (!token) {
        alert('Not authenticated');
        return;
      }


      const res = await fetch(`${backendUrl}/api/v1/auth/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log(data);

      if (data.success) {
        let firstName = '';
        let lastName = '';
        if (data.data.name) {
          const nameParts = data.data.name.trim().split(' ');
          firstName = nameParts.shift() || '';
          lastName = nameParts.join(' ') || '';
        }

        setUser({
          name: data.data.name || '',
          firstName,
          lastName,
          email: data.data.email || '',
          phone: data.data.tel || '',
          thaiId: data.data.thai_id || '',
          lineId: data.data.line_id || '',
          district: data.data.location?.district || '',
          province: data.data.location?.province || '',
          image: data.data.photo || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchUser();
}, [backendUrl]);

  const handleSave = async () => {
  try {
    const session = await getSession();
    const token = session?.accessToken || localStorage.getItem('token');
    if (!token) {
      alert('Not authenticated');
      return;
    }

    const updatedUser = {
      ...user,
      name: `${user.firstName} ${user.lastName}`.trim(), // merge into 'name'
    };

    const res = await fetch(`${backendUrl}/api/v1/auth/updateprofile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedUser),
    });

    const data = await res.json();
    if (data.success) {
      alert('Profile updated successfully');
      setIsEditing(false);
    } else {
      alert('Update failed');
    }
  } catch (error) {
    console.error(error);
    alert('An error occurred while updating');
  }
};



  if (loading) return <div className="text-white p-8">Loading...</div>;
  // Mask all but last 4 digits of a phone number
  const maskPhone = (phone: string): string => {
    if (!phone) return '';
    const visible = 4;
    const masked = '*'.repeat(Math.max(0, phone.length - visible));
    return masked + phone.slice(-visible);
  };

  // Mask email: show first 2 letters of local part, mask rest before @
  const maskEmail = (email: string): string => {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!domain) return '*'.repeat(email.length); // fallback if not a valid email
    const visible = local.slice(0, 2);
    const masked = '*'.repeat(Math.max(0, local.length - 2));
    return `${visible}${masked}@${domain}`;
  };

  // Mask all but last 6 digits of Thai ID
  const maskThaiId = (id: string): string => {
    if (!id) return '';
    const visible = 6;
    const masked = '*'.repeat(Math.max(0, id.length - visible));
    return masked + id.slice(-visible);
  };


  return (
    <div className="flex min-h-screen bg-[#3D4063]">
      <div className="flex-1 p-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="bg-[#2E3154] rounded-t-xl px-6 py-8 flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-red-300 overflow-hidden">
              <div className="w-20 h-20 rounded-full bg-red-300 overflow-hidden relative">
                <Image
                  src={user.image || '/img/default-avatar.jpg'}
                  alt="User avatar"
                  fill
                  style={{ objectFit: 'cover', borderRadius: '9999px' }} // rounded-full
                  priority={true} // optional: preload for LCP
                />
                </div>
            </div>
            <div className="text-white text-xl font-semibold">{user.name}</div>
            <div className="ml-auto">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-[#2E3154] text-white border border-white rounded-md px-4 py-2 hover:bg-white hover:text-[#2E3154]"
              >
                {isEditing ? 'Cancel' : 'Edit User Profile'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 px-6 pb-4 text-black">
            {[
              { label: 'Name', key: 'firstName', value: user.firstName },
              { label: 'Last Name', key: 'lastName', value: user.lastName },
              { label: 'Email Address', key: 'email', value: isEditing ? user.email : maskEmail(user.email) },
              { label: 'Phone Number', key: 'phone', value: isEditing ? user.phone : maskPhone(user.phone) },
              { label: 'Thai ID', key: 'thaiId', value: isEditing ? user.thaiId : maskThaiId(user.thaiId) },
              { label: 'Line ID', key: 'lineId', value: user.lineId },
              { label: 'District', key: 'district', value: user.district },
              { label: 'Province', key: 'province', value: user.province },
            ].map(({ label, key, value }) => (
              <div key={label}>
                <label className="block text-sm font-semibold">{label}</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) =>
                    setUser((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  className="w-full p-2 rounded-md bg-gray-200"
                  readOnly={!isEditing}
                />
              </div>
            ))}
          </div>
          {isEditing && (
            <div className="px-6">
              <button
                onClick={handleSave}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
