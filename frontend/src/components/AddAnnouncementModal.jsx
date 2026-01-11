import { X } from "lucide-react";
import { useState, useEffect } from "react";

const AddAnnouncementModal = ({ onClose, onAdd, existingAnnouncement }) => {
  const [heading, setHeading] = useState("");
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (existingAnnouncement) {
      setHeading(existingAnnouncement.heading || "");
      setText(existingAnnouncement.text || "");
      setLink(existingAnnouncement.link || "");
      setFiles(existingAnnouncement.files || []);
    } else {
      setHeading("");
      setText("");
      setLink("");
      setFiles([]);
    }
  }, [existingAnnouncement]);

  const handlePost = () => {
    if (!heading.trim() && !text.trim()) return; 

    const newAnnouncement = {
      id: existingAnnouncement ? existingAnnouncement.id : Date.now(),
      heading,
      text,
      link,
      files,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    onAdd(newAnnouncement);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 relative shadow-xl">

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X />
        </button>

        <h2 className="text-xl font-semibold text-teal-800 mb-4">
          {existingAnnouncement ? "Edit Announcement" : "New Announcement"}
        </h2>

        <input
          type="text"
          placeholder="Announcement Heading"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-300 font-semibold text-gray-800"
        />

        <textarea
          placeholder="Write your announcement here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full min-h-[120px] border border-gray-300 rounded-xl p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-300"
        />

        <label className="flex items-center gap-3 cursor-pointer mb-4">
          <div className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition">
            Choose Files
          </div>
          <span className="text-gray-600 text-sm truncate">
            {files.length ? files.map(f => f.name).join(", ") : "No files chosen"}
          </span>
          <input
            type="file"
            className="hidden"
            multiple
            onChange={(e) => setFiles([...e.target.files])}
          />
        </label>
        <input
          type="text"
          placeholder="Add link (optional)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-2 mb-6 focus:outline-none focus:ring-2 focus:ring-teal-300"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            Cancel
          </button>

          <button
            onClick={handlePost}
            className="px-5 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition"
          >
            {existingAnnouncement ? "Save Changes" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAnnouncementModal;
