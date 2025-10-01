"use client"
import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  FileText, 
  Edit, 
  Save, 
  Clock,
  Building,
  Gavel
} from 'lucide-react';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock user data - would come from your authentication context/API in a real app
  const [userData, setUserData] = useState({
    name: "Thomas Anree",
    email: "thomas.anree@lawfirm.com",
    phone: "+1 (555) 123-4567",
    address: "123 Legal Avenue, New York, NY 10001",
    firm: "Johnson & Associates",
    position: "Corporate Attorney",
    specialty: "Mergers & Acquisitions",
    barNumber: "NY123456",
    yearsExperience: 8,
    education: "J.D., Harvard Law School",
    bio: "Experienced corporate attorney specializing in M&A transactions and corporate governance. Worked with Fortune 500 companies on complex cross-border acquisitions."
  });

  // Mock case statistics
  const stats = [
    { label: "Active Cases", value: 12 },
    { label: "Completed Cases", value: 87 },
    { label: "Success Rate", value: "92%" },
    { label: "Hours Billed", value: 1840 }
  ];

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  // const handleSubmit = (e: { preventDefault: () => void; }) => {
  //   e.preventDefault();
  //   // Here you would typically send the updated data to your backend
  //   setIsEditing(false);
  // };

  return (
    <DefaultLayout>
    <div className="min-h-screen bg-gray-100">
      {/* Content Container */}
      <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        {/* Header with logo */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            {/* <Scale className="h-8 w-8  mr-2" /> */}
            {/* <h1 className="text-xl font-bold ">LexGenie</h1> */}
          </div>
          <button 
            onClick={handleEditToggle}
            className="flex items-center py-2 px-4 bg-white/10 backdrop-blur-sm hover:bg-white/20  rounded-md border border-white/30"
          >
            {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {isEditing ? "Save Profile" : "Edit Profile"}
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-lg bg-white/10 rounded-lg shadow-xl border border-white/30 p-6">
              {/* Profile picture and name */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center mb-4 overflow-hidden border-2 border-gray-700">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    className="text-center text-xl font-bold  bg-white/10 border border-white/30 rounded-md p-1 w-full"
                  />
                ) : (
                  <h2 className="text-xl font-bold ">{userData.name}</h2>
                )}
                <p className="text-gray-300">{userData.position}</p>
              </div>

              {/* Contact info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center ">
                  <Mail className="h-5 w-5 mr-3 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={userData.email}
                      onChange={handleInputChange}
                      className="flex-1 bg-white/10 border border-white/30 rounded-md p-1 "
                    />
                  ) : (
                    <span>{userData.email}</span>
                  )}
                </div>
                <div className="flex items-center ">
                  <Phone className="h-5 w-5 mr-3 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                      className="flex-1 bg-white/10 border border-white/30 rounded-md p-1 "
                    />
                  ) : (
                    <span>{userData.phone}</span>
                  )}
                </div>
                <div className="flex items-center ">
                  <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={userData.address}
                      onChange={handleInputChange}
                      className="flex-1 bg-white/10 border border-white/30 rounded-md p-1 "
                    />
                  ) : (
                    <span>{userData.address}</span>
                  )}
                </div>
                <div className="flex items-center ">
                  <Building className="h-5 w-5 mr-3 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="text"
                      name="firm"
                      value={userData.firm}
                      onChange={handleInputChange}
                      className="flex-1 bg-white/10 border border-white/30 rounded-md p-1 "
                    />
                  ) : (
                    <span>{userData.firm}</span>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white/5 backdrop-blur-sm p-3 rounded-md border border-white/20">
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className=" text-lg font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Professional Details */}
          <div className="lg:col-span-2">
            <div className="backdrop-blur-lg bg-white/10 rounded-lg shadow-xl border border-white/30 p-6 mb-6">
              <h3 className="text-lg font-semibold  mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2" /> Professional Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Specialty</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="specialty"
                        value={userData.specialty}
                        onChange={handleInputChange}
                        className="w-full bg-white/10 border border-white/30 rounded-md p-2 "
                      />
                    ) : (
                      <p className="">{userData.specialty}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Bar Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="barNumber"
                        value={userData.barNumber}
                        onChange={handleInputChange}
                        className="w-full bg-white/10 border border-white/30 rounded-md p-2 "
                      />
                    ) : (
                      <p className="">{userData.barNumber}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Years of Experience</label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="yearsExperience"
                        value={userData.yearsExperience}
                        onChange={handleInputChange}
                        className="w-full bg-white/10 border border-white/30 rounded-md p-2 "
                      />
                    ) : (
                      <p className="">{userData.yearsExperience} years</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Education</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="education"
                        value={userData.education}
                        onChange={handleInputChange}
                        className="w-full bg-white/10 border border-white/30 rounded-md p-2 "
                      />
                    ) : (
                      <p className="">{userData.education}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Biography Section */}
            <div className="backdrop-blur-lg bg-white/10 rounded-lg shadow-xl border border-white/30 p-6 mb-6">
              <h3 className="text-lg font-semibold  mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" /> Biography
              </h3>
              
              {isEditing ? (
                <textarea
                  name="bio"
                  value={userData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-white/10 border border-white/30 rounded-md p-3 "
                />
              ) : (
                <p className=" leading-relaxed">{userData.bio}</p>
              )}
            </div>
            
            {/* Recent Activity Section */}
            <div className="backdrop-blur-lg bg-white/10 rounded-lg shadow-xl border border-white/30 p-6">
              <h3 className="text-lg font-semibold  mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" /> Recent Activity
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start p-3 bg-white/5 rounded-md border border-white/20">
                  <Gavel className="h-5 w-5  mr-3 mt-0.5" />
                  <div>
                    <p className=" font-medium">Johnson v. Smith Corp</p>
                    <p className="text-gray-300 text-sm">Filed motion for summary judgment</p>
                    <p className="text-gray-400 text-xs">Today at 2:30 PM</p>
                  </div>
                </div>
                
                <div className="flex items-start p-3 bg-white/5 rounded-md border border-white/20">
                  <Gavel className="h-5 w-5  mr-3 mt-0.5" />
                  <div>
                    <p className=" font-medium">ABC Corp Acquisition</p>
                    <p className="text-gray-300 text-sm">Due diligence completed</p>
                    <p className="text-gray-400 text-xs">Yesterday at 11:15 AM</p>
                  </div>
                </div>
                
                <div className="flex items-start p-3 bg-white/5 rounded-md border border-white/20">
                  <Gavel className="h-5 w-5  mr-3 mt-0.5" />
                  <div>
                    <p className=" font-medium">Davis Merger Agreement</p>
                    <p className="text-gray-300 text-sm">Final contract review</p>
                    <p className="text-gray-400 text-xs">Feb 23, 2025 at 9:00 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </DefaultLayout>
  );
};

export default ProfilePage;