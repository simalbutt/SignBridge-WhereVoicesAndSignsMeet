
import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AnnouncementCard = ({ ann, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow p-6 relative hover:shadow-lg transition cursor-pointer">
    
      <div
        className="absolute top-3 right-3"
        onClick={(e) => e.stopPropagation()} 
      >
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-28 bg-white border rounded shadow-lg z-10">
            <button
              className="block w-full text-left px-3 py-2 hover:bg-gray-100"
              onClick={() => {
                onEdit(ann);
                setMenuOpen(false);
              }}
            >
              Edit
            </button>
            <button
              className="block w-full text-left px-3 py-2 text-red-500 hover:bg-gray-100"
              onClick={() => {
                onDelete(ann.id);
                setMenuOpen(false);
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {ann.heading && (
        <h2
          className="text-teal-700 font-bold text-2xl mb-3"
          onClick={() =>
            navigate(`/announcement/${ann.id}`, { state: { announcement: ann } })
          }
        >
          {ann.heading}
        </h2>
      )}

    
      {ann.text && <p className="text-gray-800 mb-4">{ann.text}</p>}

      {ann.link && (
        <a
          href={ann.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-500 hover:underline mb-4 block"
        >
          {ann.link}
        </a>
      )}

      {ann.files && ann.files.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          {ann.files.map((f, index) => (
            <a
              key={index}
              href={URL.createObjectURL(f)} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 text-sm"
            >
              {f.name}
            </a>
          ))}
        </div>
      )}

      {ann.date && <p className="text-sm text-gray-500">{ann.date}</p>}
    </div>
  );
};

export default AnnouncementCard;
