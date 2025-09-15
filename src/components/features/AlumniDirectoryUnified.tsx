import axios from "axios";
import {
  Award,
  Briefcase,
  Building,
  Calendar,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Search,
  Star,
  User,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { alumniDirectoryAPI } from "../../services/api";
import ConnectionManager from "./ConnectionManager";

interface AlumniProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  phoneNumber?: string;
  graduationYear?: string;
  batch?: string;
  placedCompany?: string;
  currentPosition?: string;
  currentCompany?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  workExperience?: number;
  achievements?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  personalWebsite?: string;
  aboutMe?: string;
  industry?: string;
  specialization?: string;
  certifications?: string[];
  projects?: string[];
  technicalSkills?: string[];
  softSkills?: string[];
  languages?: string[];
  isAvailableForMentorship?: boolean;
  profilePicture?: string;
  mentorshipAvailable?: boolean;
  // Alumni profile specific fields
  currentJob?: string;
  company?: string;
  experience?: string;
  availableForMentorship?: boolean;
}

const AlumniDirectoryUnified: React.FC = React.memo(() => {
  const { user } = useAuth();
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [filteredAlumni, setFilteredAlumni] = useState<AlumniProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadAlumniDirectory();
  }, []);

  useEffect(() => {
    filterAlumni();
  }, [searchTerm, selectedDepartment, selectedYear, alumni]);

  const loadAlumniDirectory = async () => {
    try {
      console.log("AlumniDirectoryUnified: Loading alumni directory...");
      const token = localStorage.getItem("token");

      let response;
      try {
        // For alumni users, use the specific endpoint that excludes their own profile
        if (user?.role === "ALUMNI") {
          console.log(
            "AlumniDirectoryUnified: Loading for alumni user, excluding current user"
          );
          const alumniData =
            await alumniDirectoryAPI.getAllVerifiedAlumniForAlumni();
          response = { data: alumniData };
        } else {
          console.log("AlumniDirectoryUnified: Loading for non-alumni user");
          // For other users, use the general endpoint
          const alumniData = await alumniDirectoryAPI.getAllVerifiedAlumni();
          response = { data: alumniData };
        }
      } catch (error) {
        console.warn(
          "AlumniDirectoryUnified: Primary API failed, trying fallback"
        );
        // Fallback to the old API
        response = await axios.get("https://backend-7y12.onrender.com/api/users/alumni", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // For alumni users, manually filter out current user from fallback response
        if (user?.role === "ALUMNI" && Array.isArray(response.data)) {
          response.data = response.data.filter((alum: any) => {
            if (user?.id && alum.id === user.id) return false;
            if (user?.email && alum.email === user.email) return false;
            return true;
          });
        }
      }

      // Transform the response data with enhanced profile information
      const alumniData = Array.isArray(response.data) ? response.data : [];
      console.log(
        "AlumniDirectoryUnified: Raw alumni data count:",
        alumniData.length
      );

      // Fetch complete profile data for each alumni from alumni_profiles collection
      const enhancedAlumni = await Promise.all(
        alumniData.map(async (alum: any) => {
          try {
            // Try to get enhanced profile data from alumni_profiles collection
            const profileResponse = await axios.get(
              `https://backend-7y12.onrender.com/api/alumni-profiles/complete-profile/${alum.id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            const profileData = profileResponse.data;

            console.log(
              "AlumniDirectoryUnified: Enhanced profile for",
              alum.name,
              "- ID:",
              alum.id
            );

            return {
              id: alum.id,
              name: alum.name || profileData.name || "Anonymous",
              email: alum.email || profileData.email || "",
              department:
                alum.department || profileData.department || "Unknown",
              phoneNumber: alum.phoneNumber || profileData.phoneNumber || "",
              graduationYear:
                alum.graduationYear || profileData.graduationYear || "Unknown",
              batch: alum.batch || profileData.batch || "Unknown",
              placedCompany:
                alum.placedCompany ||
                alum.currentCompany ||
                profileData.placedCompany ||
                "Not specified",
              currentPosition:
                alum.currentPosition ||
                profileData.currentPosition ||
                profileData.currentJob ||
                "",
              currentCompany:
                alum.currentCompany ||
                alum.placedCompany ||
                profileData.currentCompany ||
                profileData.company ||
                "Not specified",
              location:
                profileData.location || alum.location || "Not specified", // Prioritize location from alumni_profiles
              bio: alum.bio || profileData.bio || profileData.aboutMe || "",
              skills:
                alum.skills ||
                profileData.skills ||
                profileData.technicalSkills ||
                [],
              workExperience:
                alum.workExperience ||
                profileData.workExperience ||
                (profileData.experience ? parseInt(profileData.experience) : 0),
              achievements: alum.achievements || profileData.achievements || [],
              linkedinUrl: alum.linkedinUrl || profileData.linkedinUrl || "",
              githubUrl: alum.githubUrl || profileData.githubUrl || "",
              portfolioUrl: alum.portfolioUrl || profileData.portfolioUrl || "",
              personalWebsite: profileData.personalWebsite || "",
              aboutMe: profileData.aboutMe || alum.bio || "",
              industry: alum.industry || profileData.industry || "",
              specialization:
                alum.specialization || profileData.specialization || "",
              certifications:
                alum.certifications || profileData.certifications || [],
              projects: alum.projects || profileData.projects || [],
              technicalSkills: profileData.technicalSkills || [],
              softSkills: profileData.softSkills || [],
              languages: profileData.languages || [],
              isAvailableForMentorship:
                alum.isAvailableForMentorship ||
                profileData.isAvailableForMentorship ||
                profileData.availableForMentorship ||
                false,
              mentorshipAvailable:
                alum.mentorshipAvailable ||
                profileData.mentorshipAvailable ||
                profileData.isAvailableForMentorship ||
                false,
              profilePicture:
                alum.profilePicture || profileData.profilePicture || "",
              // Legacy fields for backward compatibility
              currentJob: profileData.currentJob || alum.currentPosition || "",
              company: profileData.company || alum.currentCompany || "",
              experience:
                profileData.experience ||
                (alum.workExperience ? alum.workExperience.toString() : ""),
              availableForMentorship:
                profileData.availableForMentorship ||
                alum.isAvailableForMentorship ||
                false,
            };
          } catch (profileError) {
            console.warn(
              `Failed to load enhanced profile for ${alum.id}:`,
              profileError
            );
            // Return basic alumni data if enhanced profile fails
            console.log(
              "AlumniDirectoryUnified: Using basic profile for",
              alum.name,
              "- ID:",
              alum.id
            );

            return {
              id: alum.id,
              name: alum.name || "Anonymous",
              email: alum.email || "",
              department: alum.department || "Unknown",
              phoneNumber: alum.phoneNumber || "",
              graduationYear: alum.graduationYear || "Unknown",
              batch: alum.batch || "Unknown",
              placedCompany:
                alum.placedCompany || alum.currentCompany || "Not specified",
              currentPosition: alum.currentPosition || "",
              currentCompany:
                alum.currentCompany || alum.placedCompany || "Not specified",
              location: alum.location || "Location not specified", // Use proper fallback for location
              bio: alum.bio || "",
              skills: alum.skills || [],
              workExperience: alum.workExperience || 0,
              achievements: alum.achievements || [],
              linkedinUrl: alum.linkedinUrl || "",
              githubUrl: alum.githubUrl || "",
              portfolioUrl: alum.portfolioUrl || "",
              personalWebsite: "",
              aboutMe: alum.bio || "",
              industry: alum.industry || "",
              specialization: alum.specialization || "",
              certifications: [],
              projects: [],
              technicalSkills: [],
              softSkills: [],
              languages: [],
              isAvailableForMentorship: alum.isAvailableForMentorship || false,
              mentorshipAvailable: alum.mentorshipAvailable || false,
              profilePicture: alum.profilePicture || "",
              currentJob: alum.currentPosition || "",
              company: alum.currentCompany || "",
              experience: alum.workExperience
                ? alum.workExperience.toString()
                : "",
              availableForMentorship: alum.isAvailableForMentorship || false,
            };
          }
        })
      );

      setAlumni(enhancedAlumni);
      console.log(
        "AlumniDirectoryUnified: Enhanced alumni directory loaded successfully:",
        enhancedAlumni.length,
        "alumni"
      );
    } catch (error: any) {
      console.error("Error loading alumni directory:", error);
      // Don't show error toast if it's just no alumni available
      if (error.response?.status !== 404) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data ||
          "Failed to load alumni directory";
        showToast(errorMessage, "error");
      }
      setAlumni([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAlumni = () => {
    let filtered = [...alumni];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (alum) =>
          alum.name.toLowerCase().includes(term) ||
          alum.email.toLowerCase().includes(term) ||
          alum.department?.toLowerCase().includes(term) ||
          alum.currentCompany?.toLowerCase().includes(term) ||
          alum.placedCompany?.toLowerCase().includes(term) ||
          alum.currentPosition?.toLowerCase().includes(term)
      );
    }

    // Filter by department
    if (selectedDepartment) {
      filtered = filtered.filter(
        (alum) => alum.department === selectedDepartment
      );
    }

    // Filter by graduation year
    if (selectedYear) {
      filtered = filtered.filter(
        (alum) => alum.graduationYear === selectedYear
      );
    }

    setFilteredAlumni(filtered);
  };

  const handleViewProfile = (alumni: AlumniProfile) => {
    setSelectedAlumni(alumni);
    setShowDetailModal(true);
  };

  const handleConnectionUpdate = () => {
    // Refresh the alumni list to update connection statuses
    loadAlumniDirectory();
  };

  const getDepartments = () => {
    const departments = new Set(
      alumni.map((alum) => alum.department).filter(Boolean)
    );
    return Array.from(departments).sort();
  };

  const getGraduationYears = () => {
    const years = new Set(
      alumni.map((alum) => alum.graduationYear).filter(Boolean)
    );
    return Array.from(years).sort().reverse();
  };

  if (loading) {
    return (
      <div className="card content-padding">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/20 border-t-primary-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-500" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-white">
            Loading Alumni Network
          </p>
          <p className="text-sm text-white/60">
            Connecting you with our accomplished alumni
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-purple-800">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Alumni Network Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Alumni Network
                </h1>
                <p className="text-white/70">
                  Connect with {alumni.length} verified alumni from our
                  community
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white">
                {alumni.length}
              </div>
              <div className="text-white/70 text-sm">Total Alumni</div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">
                {
                  alumni.filter(
                    (a) =>
                      a.isAvailableForMentorship ||
                      a.mentorshipAvailable ||
                      a.availableForMentorship
                  ).length
                }
              </div>
              <div className="text-sm text-green-300">Available Mentors</div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Building className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">
                {new Set(alumni.map((a) => a.department)).size}
              </div>
              <div className="text-sm text-blue-300">Departments</div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">
                {new Set(alumni.map((a) => a.currentCompany)).size}
              </div>
              <div className="text-sm text-purple-300">Companies</div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">
                {new Set(alumni.map((a) => a.location)).size}
              </div>
              <div className="text-sm text-orange-300">Locations</div>
            </div>
          </div>
        </div>

        {/* Find Alumni Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Find Alumni</h2>

          <div className="space-y-6">
            {/* Search Bar */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Search Alumni
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, company, position..."
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur"
                >
                  <option value="" className="bg-gray-800">
                    All Departments
                  </option>
                  {getDepartments().map((dept) => (
                    <option key={dept} value={dept} className="bg-gray-800">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Graduation Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur"
                >
                  <option value="" className="bg-gray-800">
                    All Years
                  </option>
                  {getGraduationYears().map((year) => (
                    <option key={year} value={year} className="bg-gray-800">
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Results Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-white/20">
              <div className="text-white/70 text-sm">
                Showing{" "}
                <span className="text-white font-semibold">
                  {filteredAlumni.length}
                </span>{" "}
                of{" "}
                <span className="text-white font-semibold">
                  {alumni.length}
                </span>{" "}
                alumni
              </div>
              {(searchTerm || selectedDepartment || selectedYear) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedDepartment("");
                    setSelectedYear("");
                  }}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium self-start sm:self-auto"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Alumni Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAlumni.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No Alumni Found
                </h3>
                <p className="text-white/70">
                  Try adjusting your search criteria or browse all alumni.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedDepartment("");
                    setSelectedYear("");
                  }}
                  className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Show All Alumni
                </button>
              </div>
            </div>
          ) : (
            filteredAlumni.map((alum, _) => (
              <div
                key={alum.id}
                className="group relative bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden h-fit"
              >
                {/* Alumni Card Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      {alum.profilePicture ? (
                        <img
                          src={alum.profilePicture}
                          alt={alum.name}
                          className="w-full h-full rounded-xl object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg leading-tight truncate">
                        {alum.name}
                      </h3>
                      <p className="text-white/90 text-sm truncate">
                        {alum.currentPosition || alum.currentJob || "Alumni"}
                      </p>
                      <p className="text-white/70 text-xs truncate">
                        {alum.currentCompany ||
                          alum.company ||
                          "Company not specified"}
                      </p>
                    </div>

                    {(alum.isAvailableForMentorship ||
                      alum.mentorshipAvailable ||
                      alum.availableForMentorship) && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse flex-shrink-0">
                        <UserCheck className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Alumni Card Content */}
                <div className="p-4 space-y-4">
                  {/* Key Information Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-lg p-3 border border-blue-500/20">
                      <div className="flex items-center space-x-2 text-blue-400 mb-1">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="font-medium text-xs">Graduation</span>
                      </div>
                      <div className="text-white font-semibold text-sm">
                        {alum.graduationYear || "N/A"}
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-lg p-3 border border-green-500/20">
                      <div className="flex items-center space-x-2 text-green-400 mb-1">
                        <Building className="h-3 w-3 flex-shrink-0" />
                        <span className="font-medium text-xs">Department</span>
                      </div>
                      <div
                        className="text-white font-semibold text-sm truncate"
                        title={alum.department}
                      >
                        {alum.department}
                      </div>
                    </div>
                  </div>

                  {/* Location & Experience */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-lg p-3 border border-purple-500/20">
                      <div className="flex items-center space-x-2 text-purple-400 mb-1">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="font-medium text-xs">Location</span>
                      </div>
                      <div
                        className="text-white font-semibold text-sm truncate"
                        title={alum.location || "Not specified"}
                      >
                        {alum.location || "Not specified"}
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-lg p-3 border border-orange-500/20">
                      <div className="flex items-center space-x-2 text-orange-400 mb-1">
                        <Award className="h-3 w-3 flex-shrink-0" />
                        <span className="font-medium text-xs">Experience</span>
                      </div>
                      <div className="text-white font-semibold text-sm">
                        {alum.workExperience
                          ? `${alum.workExperience}+ years`
                          : "Not specified"}
                      </div>
                    </div>
                  </div>

                  {/* Skills Preview */}
                  {alum.skills && alum.skills.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-white/90 text-sm font-semibold">
                        Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {alum.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 rounded-lg text-xs font-medium border border-blue-500/30"
                          >
                            {skill}
                          </span>
                        ))}
                        {alum.skills.length > 3 && (
                          <span className="px-2 py-1 bg-white/10 text-white/60 rounded-lg text-xs font-medium border border-white/20">
                            +{alum.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mentorship Status */}
                  <div
                    className={`rounded-xl p-4 border transition-all duration-300 ${
                      alum.isAvailableForMentorship ||
                      alum.mentorshipAvailable ||
                      alum.availableForMentorship
                        ? "bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30"
                        : "bg-gradient-to-br from-white/5 to-white/10 border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {alum.isAvailableForMentorship ||
                        alum.mentorshipAvailable ||
                        alum.availableForMentorship ? (
                          <>
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                              <UserCheck className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-green-300">
                                Available for Mentoring
                              </span>
                              <p className="text-xs text-green-400">
                                Ready to guide and support
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                              <User className="h-4 w-4 text-white/60" />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-white/70">
                                Connect & Network
                              </span>
                              <p className="text-xs text-white/50">
                                Professional networking available
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                      {(alum.isAvailableForMentorship ||
                        alum.mentorshipAvailable ||
                        alum.availableForMentorship) && (
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={() => handleViewProfile(alum)}
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex-1 py-2.5 text-sm"
                    >
                      View Profile
                    </button>

                    <button
                      onClick={() =>
                        window.open(`mailto:${alum.email}`, "_blank")
                      }
                      className="bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex-1 py-2.5 text-sm"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Contact
                    </button>
                  </div>

                  {/* Connection Manager */}
                  {(alum.isAvailableForMentorship ||
                    alum.mentorshipAvailable ||
                    alum.availableForMentorship) && (
                    <div className="pt-2">
                      <ConnectionManager
                        targetUserId={alum.id}
                        targetUserName={alum.name}
                        onConnectionUpdate={handleConnectionUpdate}
                        buttonText="Request Mentoring"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Enhanced Detail Modal */}
        {showDetailModal && selectedAlumni && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl max-w-5xl w-full my-8 mx-4">
              <div className="max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                        {selectedAlumni.profilePicture ? (
                          <img
                            src={selectedAlumni.profilePicture}
                            alt={selectedAlumni.name}
                            className="w-full h-full rounded-2xl object-cover"
                          />
                        ) : (
                          <User className="h-8 w-8 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-bold text-white">
                          {selectedAlumni.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-white/80 mt-1">
                          <span className="text-lg">
                            {selectedAlumni.currentPosition ||
                              selectedAlumni.currentJob ||
                              "Alumni"}
                          </span>
                          {(selectedAlumni.isAvailableForMentorship ||
                            selectedAlumni.mentorshipAvailable ||
                            selectedAlumni.availableForMentorship) && (
                            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium border border-green-500/30">
                              Available for Mentorship
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors p-3 flex-shrink-0"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Contact & Academic Info */}
                    <div className="space-y-4">
                      {/* Contact Information */}
                      <div className="glass-soft rounded-xl p-4 border border-white/20">
                        <h4 className="text-lg font-semibold text-white mb-3">
                          Contact Information
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-blue-400 flex-shrink-0" />
                            <span className="text-white/80 text-sm break-all">
                              {selectedAlumni.email}
                            </span>
                          </div>

                          {selectedAlumni.phoneNumber && (
                            <div className="flex items-center space-x-3">
                              <Phone className="h-4 w-4 text-green-400 flex-shrink-0" />
                              <span className="text-white/80 text-sm">
                                {selectedAlumni.phoneNumber}
                              </span>
                            </div>
                          )}

                          {selectedAlumni.location && (
                            <div className="flex items-center space-x-3">
                              <MapPin className="h-4 w-4 text-purple-400 flex-shrink-0" />
                              <span className="text-white/80 text-sm">
                                {selectedAlumni.location}
                              </span>
                            </div>
                          )}

                          {/* Social Links */}
                          {(selectedAlumni.linkedinUrl ||
                            selectedAlumni.githubUrl ||
                            selectedAlumni.portfolioUrl) && (
                            <div className="pt-3 border-t border-white/10">
                              <div className="flex space-x-3">
                                {selectedAlumni.linkedinUrl && (
                                  <a
                                    href={selectedAlumni.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white/20 hover:bg-white/30 text-blue-400 rounded-lg transition-colors p-2"
                                  >
                                    <Linkedin className="h-5 w-5" />
                                  </a>
                                )}
                                {selectedAlumni.githubUrl && (
                                  <a
                                    href={selectedAlumni.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white/20 hover:bg-white/30 text-white/80 rounded-lg transition-colors p-2"
                                  >
                                    <Github className="h-5 w-5" />
                                  </a>
                                )}
                                {selectedAlumni.portfolioUrl && (
                                  <a
                                    href={selectedAlumni.portfolioUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white/20 hover:bg-white/30 text-purple-400 rounded-lg transition-colors p-2"
                                  >
                                    <User className="h-5 w-5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Academic Information */}
                      <div className="glass-soft rounded-xl p-4 border border-blue-500/20">
                        <h4 className="text-lg font-semibold text-blue-300 mb-3">
                          Academic Background
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-blue-400 text-sm">
                              Department:
                            </span>
                            <span className="font-medium text-white text-sm">
                              {selectedAlumni.department}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-blue-400 text-sm">
                              Graduation Year:
                            </span>
                            <span className="font-medium text-white text-sm">
                              {selectedAlumni.graduationYear || "Unknown"}
                            </span>
                          </div>
                          {selectedAlumni.batch && (
                            <div className="flex justify-between items-center">
                              <span className="text-blue-400 text-sm">
                                Batch:
                              </span>
                              <span className="font-medium text-white text-sm">
                                {selectedAlumni.batch}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Professional Info */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Professional Summary */}
                      <div className="glass-soft rounded-xl p-4 border border-white/20">
                        <h4 className="text-lg font-semibold text-white mb-3">
                          Professional Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <span className="text-white/60">
                              Current Position:
                            </span>
                            <p className="font-medium text-white">
                              {selectedAlumni.currentPosition ||
                                selectedAlumni.currentJob ||
                                "Not specified"}
                            </p>
                          </div>
                          <div>
                            <span className="text-white/60">Company:</span>
                            <p className="font-medium text-white">
                              {selectedAlumni.currentCompany ||
                                selectedAlumni.company ||
                                selectedAlumni.placedCompany ||
                                "Not specified"}
                            </p>
                          </div>
                          {selectedAlumni.industry && (
                            <div>
                              <span className="text-white/60">Industry:</span>
                              <p className="font-medium text-white">
                                {selectedAlumni.industry}
                              </p>
                            </div>
                          )}
                          {selectedAlumni.workExperience &&
                            selectedAlumni.workExperience > 0 && (
                              <div>
                                <span className="text-white/60">
                                  Experience:
                                </span>
                                <p className="font-medium text-white">
                                  {selectedAlumni.workExperience} years
                                </p>
                              </div>
                            )}
                          {selectedAlumni.specialization && (
                            <div className="md:col-span-2">
                              <span className="text-white/60">
                                Specialization:
                              </span>
                              <p className="font-medium text-white">
                                {selectedAlumni.specialization}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* About Me */}
                      {(selectedAlumni.bio || selectedAlumni.aboutMe) && (
                        <div className="glass-soft rounded-2xl p-6 border border-white/20">
                          <h4 className="text-lg font-semibold text-white mb-4">
                            About
                          </h4>
                          <p className="text-white/80 leading-relaxed">
                            {selectedAlumni.bio || selectedAlumni.aboutMe}
                          </p>
                        </div>
                      )}

                      {/* Skills */}
                      {((selectedAlumni.skills &&
                        selectedAlumni.skills.length > 0) ||
                        (selectedAlumni.technicalSkills &&
                          selectedAlumni.technicalSkills.length > 0)) && (
                        <div className="glass-soft rounded-2xl p-6 border border-white/20">
                          <h4 className="text-lg font-semibold text-white mb-4">
                            Skills & Expertise
                          </h4>
                          <div className="space-y-4">
                            {selectedAlumni.technicalSkills &&
                              selectedAlumni.technicalSkills.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium text-blue-300 mb-2">
                                    Technical Skills
                                  </h5>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedAlumni.technicalSkills.map(
                                      (skill, index) => (
                                        <span
                                          key={index}
                                          className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                                        >
                                          {skill}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {selectedAlumni.skills &&
                              selectedAlumni.skills.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium text-orange-300 mb-2">
                                    General Skills
                                  </h5>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedAlumni.skills.map(
                                      (skill, index) => (
                                        <span
                                          key={index}
                                          className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm border border-orange-500/30"
                                        >
                                          {skill}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {selectedAlumni.softSkills &&
                              selectedAlumni.softSkills.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium text-green-300 mb-2">
                                    Soft Skills
                                  </h5>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedAlumni.softSkills.map(
                                      (skill, index) => (
                                        <span
                                          key={index}
                                          className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30"
                                        >
                                          {skill}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      )}

                      {/* Achievements */}
                      {selectedAlumni.achievements &&
                        selectedAlumni.achievements.length > 0 && (
                          <div className="glass-soft rounded-2xl p-6 border border-yellow-500/20">
                            <h4 className="text-lg font-semibold text-yellow-300 mb-4 flex items-center space-x-2">
                              <Award className="h-5 w-5" />
                              <span>Achievements</span>
                            </h4>
                            <div className="space-y-3">
                              {selectedAlumni.achievements.map(
                                (achievement, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start space-x-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20"
                                  >
                                    <Star className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-white/80 text-sm">
                                      {achievement}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Certifications */}
                      {selectedAlumni.certifications &&
                        selectedAlumni.certifications.length > 0 && (
                          <div className="glass-soft rounded-2xl p-6 border border-green-500/20">
                            <h4 className="text-lg font-semibold text-green-300 mb-4">
                              Certifications
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {selectedAlumni.certifications.map(
                                (cert, index) => (
                                  <div
                                    key={index}
                                    className="bg-green-500/10 p-3 rounded-lg text-sm text-green-300 border border-green-500/20"
                                  >
                                    {cert}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Projects */}
                      {selectedAlumni.projects &&
                        selectedAlumni.projects.length > 0 && (
                          <div className="glass-soft rounded-2xl p-6 border border-purple-500/20">
                            <h4 className="text-lg font-semibold text-purple-300 mb-4">
                              Notable Projects
                            </h4>
                            <div className="space-y-3">
                              {selectedAlumni.projects.map((project, index) => (
                                <div
                                  key={index}
                                  className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/20"
                                >
                                  <p className="text-purple-300 text-sm">
                                    {project}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="btn-secondary flex-1 py-3"
                    >
                      Close
                    </button>

                    <button
                      onClick={() =>
                        window.open(`mailto:${selectedAlumni.email}`, "_blank")
                      }
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex-1 py-3 flex items-center justify-center space-x-2"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Send Email</span>
                    </button>

                    {/* Connect Button in Modal */}
                    {(selectedAlumni.isAvailableForMentorship ||
                      selectedAlumni.mentorshipAvailable ||
                      selectedAlumni.availableForMentorship) && (
                      <div className="flex-1">
                        <ConnectionManager
                          targetUserId={selectedAlumni.id}
                          targetUserName={selectedAlumni.name}
                          onConnectionUpdate={handleConnectionUpdate}
                          buttonText="Request Mentoring"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default AlumniDirectoryUnified;
