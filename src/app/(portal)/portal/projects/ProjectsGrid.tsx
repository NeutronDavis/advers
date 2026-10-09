"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Globe,
  Tv,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Plus,
  Layers,
} from "lucide-react";

export interface DynamicProjectItem {
  id: string;
  name: string;
  category: string;
  packageTier: string;
  status: string;
  progress: number;
  image: string;
  deliveryOrRenewal: string;
  metrics?: string;
  link: string;
}

export default function ProjectsGrid({
  initialProjects,
}: {
  initialProjects: DynamicProjectItem[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const filteredProjects = initialProjects.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.packageTier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;

    const matchesStatus =
      selectedStatus === "ALL" || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-entrance pb-12">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight flex items-center gap-2">
            <Layers className="w-7 h-7 text-primary" />
            <span>Subscribed Projects &amp; Placements</span>
            <span className="badge badge-primary text-xs font-bold">
              {filteredProjects.length} Active
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 font-medium mt-1">
            Real-time grid view of your subscribed digital packages, outdoor billboard reservations, and care plans.
          </p>
        </div>

        <Link
          href="/visibility-journey"
          className="btn bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs font-bold rounded-xl border-none shadow-md gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Package</span>
        </Link>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-base-100 p-4 rounded-3xl border border-base-200 shadow-3d space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name, ID, or package..."
              className="input input-bordered w-full pl-10 bg-base-200/50 text-xs h-10 rounded-xl focus:border-primary"
            />
            <Search className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3" />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select select-bordered w-full bg-base-200/50 text-xs h-10 min-h-0 rounded-xl"
          >
            <option value="ALL">All Categories</option>
            <option value="DIGITAL_PACKAGE">Digital Web Suites</option>
            <option value="ECOSYSTEM">Ecosystem Growth</option>
            <option value="BILLBOARD">Billboard Placements</option>
            <option value="CARE_PLAN">Care Plans</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="select select-bordered w-full bg-base-200/50 text-xs h-10 min-h-0 rounded-xl"
          >
            <option value="ALL">All Statuses</option>
            <option value="ONBOARDING_IN_PROGRESS">In Onboarding</option>
            <option value="IN_PRODUCTION">In Production</option>
            <option value="ACTIVE">Active</option>
            <option value="PROSPECT">Prospect</option>
          </select>
        </div>
      </div>

      {/* Dynamic Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-base-100 p-12 rounded-3xl border border-base-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mx-auto text-base-content/40">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-base-content">No active projects found</h3>
          <p className="text-xs text-base-content/60 max-w-sm mx-auto">
            You currently have no subscribed projects matching your filter criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
              setSelectedStatus("ALL");
            }}
            className="btn btn-outline border-base-300 text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-base-100 rounded-3xl border border-base-200 shadow-3d hover:border-primary/40 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Image Banner Header */}
                <div className="relative h-44 w-full bg-base-200 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                    <span className="badge bg-base-100/90 backdrop-blur-md text-[10px] font-extrabold border-none shadow-xs flex items-center gap-1.5 text-base-content">
                      {project.category === "BILLBOARD" ? (
                        <Tv className="w-3 h-3 text-amber-500" />
                      ) : project.category === "CARE_PLAN" ? (
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Globe className="w-3 h-3 text-primary" />
                      )}
                      <span>{project.category.replace("_", " ")}</span>
                    </span>

                    <span
                      className={`badge text-[10px] font-extrabold border-none shadow-xs ${
                        project.status === "ACTIVE"
                          ? "bg-emerald-500 text-white"
                          : project.status === "IN_PRODUCTION" || project.status === "ONBOARDING_IN_PROGRESS"
                          ? "bg-amber-500 text-white animate-pulse"
                          : "bg-indigo-500 text-white"
                      }`}
                    >
                      {project.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Subtitle Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider block">
                      {project.id} • {project.packageTier}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-4">
                  <h3 className="text-base font-extrabold text-base-content leading-snug group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>

                  {/* Onboarding Progress Bar */}
                  <div className="space-y-1.5 bg-base-200/40 p-3 rounded-2xl border border-base-200">
                    <div className="flex justify-between text-[11px] font-bold text-base-content/80">
                      <span>Production Progress</span>
                      <span className="text-primary">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-base-300 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {project.metrics && (
                    <div className="text-xs font-semibold text-base-content/70 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{project.metrics}</span>
                    </div>
                  )}

                  <div className="text-[11px] font-bold text-base-content/60 pt-2 border-t border-base-200">
                    {project.deliveryOrRenewal}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <Link
                  href={project.link}
                  className="btn btn-outline border-base-300 hover:bg-primary hover:text-white hover:border-primary text-xs font-bold rounded-xl w-full flex items-center justify-between transition-all"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
