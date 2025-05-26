import { useEffect, useState } from "react";
import Link from "next/link";

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    fetch("/api/company")
      .then((res) => res.json())
      .then((data) => setCompanies(data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Companies</h1>
      <ul>
        {companies.map((company) => (
          <li key={company.id} className="mb-2">
            <Link href={`/company/${company.id}`}>
              <a className="text-blue-500 hover:underline">{company.name}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompanyList;
