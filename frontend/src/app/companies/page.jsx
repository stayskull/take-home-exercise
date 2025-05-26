"use client"; // This is a client component

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../../lib/api";
import CompanyForm from "../../components/CompanyForm";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  const loadCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCompanies();
      setCompanies(data);
    } catch (err) {
      setError(err.message);
      console.error("Failed to load companies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleCreateOrUpdateCompany = async (companyData) => {
    try {
      if (editingCompany) {
        await updateCompany(editingCompany.id, companyData);
      } else {
        await createCompany(companyData);
      }
      setShowForm(false);
      setEditingCompany(null);
      await loadCompanies(); // Reload companies
    } catch (err) {
      setError(err.message);
      alert(`Operation failed: ${err.message}`);
    }
  };

  const handleDeleteCompany = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this company? This action cannot be undone."
      )
    ) {
      try {
        await deleteCompany(id);
        await loadCompanies(); // Reload companies
      } catch (err) {
        setError(err.message);
        alert(`Deletion failed: ${err.message}`);
      }
    }
  };

  if (loading)
    return (
      <div className="text-center text-2xl mt-12 text-gray-600">
        Loading companies...
      </div>
    );
  if (error)
    return (
      <div className="text-center text-2xl mt-12 text-red-600">
        Error: {error}
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-5xl font-extrabold mb-10 text-center text-gray-900">
        Companies
      </h1>

      <div className="flex justify-end mb-8">
        <button
          onClick={() => {
            setEditingCompany(null);
            setShowForm(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105"
        >
          Add New Company
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-xl w-full relative">
            <button
              onClick={() => {
                setShowForm(false);
                setEditingCompany(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
            <CompanyForm
              company={editingCompany}
              onSubmit={handleCreateOrUpdateCompany}
              onCancel={() => {
                setShowForm(false);
                setEditingCompany(null);
              }}
            />
          </div>
        </div>
      )}

      {companies.length === 0 ? (
        <p className="text-center text-gray-600 text-xl">
          No companies found. Add one to get started!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-xl shadow-lg p-7 border border-gray-200 flex flex-col justify-between transform hover:scale-105 transition duration-200 ease-in-out"
            >
              <div>
                <h2 className="text-3xl font-semibold text-blue-800 mb-3">
                  {company.name}
                </h2>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Industry:</span>{" "}
                  {company.industry}
                </p>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Size:</span> {company.size}
                </p>
                <p className="text-gray-700 mb-4">
                  <span className="font-medium">LLM:</span> {company.llm}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-5">
                <Link
                  href={`/companies/${company.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg text-sm shadow-md transition duration-200 ease-in-out"
                >
                  View Personas
                </Link>
                <button
                  onClick={() => {
                    setEditingCompany(company);
                    setShowForm(true);
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2.5 px-5 rounded-lg text-sm shadow-md transition duration-200 ease-in-out"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCompany(company.id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-lg text-sm shadow-md transition duration-200 ease-in-out"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
