import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const AnnouncementDetail = () => {
  const location = useLocation();
  const { announcement } = location.state || {}; 
  const initialComments = [
    {
      id: 1,
      student: "Khan BiBi",
      program: "FAST LHR NU BSCS 2022",
      text: "JazakAllah for the kind words. Stay blessed",
      date: "Dec 18, 2025",
      reply: "",
      translated: "Thank you very much for the kind words. Stay blessed", 
    },
    {
      id: 2,
      student: "Abdullah Butt",
      program: "BSCS 2022 FAST NU LHR",
      text: "Thanks a lot Sir",
      date: "Dec 18, 2025",
      reply: "",
      translated: "Thank you very much, Sir",
    },
    {
      id: 3,
      student: "Sara Ahmed",
      program: "BSCS 2022 FAST NU LHR",
      text: "Looking forward to the next update!",
      date: "Dec 17, 2025",
      reply: "",
      translated: "Eagerly waiting for the next update!",
    },
  ];

  const [comments, setComments] = useState(initialComments);
  const [replyText, setReplyText] = useState({}); 
  const [showTranslation, setShowTranslation] = useState({}); 
  if (!announcement) return <p>No announcement found!</p>;

  const handleReply = (id) => {
    if (!replyText[id]) return;
    setComments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, reply: replyText[id] } : c
      )
    );
    setReplyText((prev) => ({ ...prev, [id]: "" }));
  };

  const toggleTranslation = (id) => {
    setShowTranslation((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen p-6 bg-teal-50">
    <div className="max-w-4xl mx-auto p-6 bg-teal-100 rounded shadow mt-6">
    
      <div className="bg-teal-50 p-6 rounded shadow-md mb-6">
        <h1 className="text-3xl font-bold mb-4 text-teal-700">{announcement.heading}</h1>
        <p className="text-gray-800 mb-4">{announcement.text}</p>

        {announcement.link && (
          <a
            href={announcement.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-500 hover:underline mb-4 block"
          >
            {announcement.link}
          </a>
        )}

        {announcement.files && announcement.files.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {announcement.files.map((f, index) => (
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

        <p className="text-sm text-gray-500">{announcement.date}</p>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Comments</h2>

        <div className="space-y-4 max-h-80 overflow-y-auto">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white p-3 rounded shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-700 text-sm">
                  {comment.student} • {comment.program} • {comment.date}
                </p>
                <ArrowRight className="w-4 h-4 text-teal-500 cursor-pointer" />
              </div>

              <p className="text-gray-800 text-sm mt-1">
                {showTranslation[comment.id] ? comment.translated : comment.text}
              </p>

              <button
                className="text-teal-500 text-xs mt-1 hover:underline"
                onClick={() => toggleTranslation(comment.id)}
              >
                {showTranslation[comment.id] ? "See Original" : "See Translation"}
              </button>

              {comment.reply && (
                <div className="bg-teal-50 p-2 rounded mt-2 ml-6">
                  <p className="text-teal-700 font-semibold text-sm">Teacher Reply:</p>
                  <p className="text-gray-800 text-sm">{comment.reply}</p>
                </div>
              )}

              <div className="mt-2 ml-6 flex gap-2">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  className="flex-1 border rounded p-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={replyText[comment.id] || ""}
                  onChange={(e) =>
                    setReplyText((prev) => ({ ...prev, [comment.id]: e.target.value }))
                  }
                />
                <button
                  className="bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600 text-sm"
                  onClick={() => handleReply(comment.id)}
                >
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};

export default AnnouncementDetail;
