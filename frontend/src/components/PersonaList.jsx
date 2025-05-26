import { useEffect, useState } from "react";
import Link from "next/link";

const PersonaList = ({ companyId }) => {
  const [personas, setPersonas] = useState([]);

  useEffect(() => {
    fetch(`/api/persona?company_id=${companyId}`)
      .then((res) => res.json())
      .then((data) => setPersonas(data));
  }, [companyId]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Personas</h2>
      <ul>
        {personas.map((persona) => (
          <li key={persona.id} className="mb-2">
            <Link href={`/chat/${persona.id}`}>
              <a className="text-green-500 hover:underline">{persona.name}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PersonaList;
