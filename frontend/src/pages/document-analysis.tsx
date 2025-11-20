import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";

export default function DocumentAnalysis() {
  const navigate = useNavigate();

  // Check if risk assessment has been completed
  useEffect(() => {
    const riskAssessment = localStorage.getItem("riskAssessment");
    if (!riskAssessment) {
      alert("Please complete the risk assessment first before using document analysis.");
      navigate("/input");
    }
  }, [navigate]);

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-[#0a0a0a] ml-64">
        <div className="border-b border-gray-800 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div>
              <h1 className="text-3xl font-bold text-white">
                AI-Assisted Document Analysis
              </h1>
              <p className="text-gray-400 mt-1">
                Upload and analyze project documents with AI
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/10 flex items-center justify-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  className="text-orange-500"
                >
                  <path
                    d="M19 3H8C7.46957 3 6.96086 3.21071 6.58579 3.58579C6.21071 3.96086 6 4.46957 6 5V27C6 27.5304 6.21071 28.0391 6.58579 28.4142C6.96086 28.7893 7.46957 29 8 29H24C24.5304 29 25.0391 28.7893 25.4142 28.4142C25.7893 28.0391 26 27.5304 26 27V10L19 3Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <path
                    d="M19 3V10H26"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11 17H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M11 22H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M11 12H13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Document Analysis Coming Soon
              </h2>
              <p className="text-gray-400 max-w-md">
                Upload project documents and let our AI extract key insights and
                risk indicators automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

