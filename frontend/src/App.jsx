import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import axios from "axios";

function App() {
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState("null");
  const [metricsData, setMetricsData] = useState([
    { time: "1", cpu: 20, memory: 30 },
    { time: "2", cpu: 35, memory: 40 },
    { time: "3", cpu: 25, memory: 50 },
    { time: "4", cpu: 50, memory: 45 },
    { time: "5", cpu: 40, memory: 60 },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [metrics, setMetrics] = useState([]);

  // Fetch pods from backend
  useEffect(() => {
    fetchPods();
    fetchMetrics();
  
    const interval = setInterval(() => {
      fetchPods();
      fetchMetrics();
    }, 5000);
  
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
  
      setMetricsData((prev) => {
        const newData = [...prev];
  
        newData.shift();
  
        newData.push({
          time: Date.now().toString().slice(-2),
          cpu: Math.floor(Math.random() * 100),
          memory: Math.floor(Math.random() * 100),
        });
  
        return newData;
      });
  
    }, 3000);
  
    return () => clearInterval(interval);
  
  }, []);

  const fetchPods = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/pods");

      setPods(response.data.pods);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  const fetchMetrics = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/metrics"
      );
  
      setMetrics(response.data.metrics);
    } catch (error) {
      console.error(error);
    }
  };

  // Analyze pod logs
  const analyzePod = async (podName, namespace) => {
    try {
      setSelectedAnalysis("Analyzing logs with AI...");

      const response = await axios.get(
        `http://127.0.0.1:8000/analyze/${podName}?namespace=${namespace}`
      );

      const analysisText = response.data.analysis;

let severity = "LOW";

if (
  analysisText.includes("critical") ||
  analysisText.includes("CrashLoopBackOff") ||
  analysisText.includes("failed")
) {
  severity = "HIGH";
} else if (
  analysisText.includes("warning") ||
  analysisText.includes("error")
) {
  severity = "MEDIUM";
}

setSelectedAnalysis({
  text: analysisText,
  severity: severity,
});
    } catch (error) {
      console.error(error);

      setSelectedAnalysis("Failed to analyze pod.");
    }
  };

  const totalPods = pods.length;

const runningPods = pods.filter(
  (pod) => pod.status === "Running"
).length;

const failedPods = pods.filter(
  (pod) =>
    pod.status === "Failed" ||
    pod.status === "Error"
).length;

const healthPercentage =
  totalPods > 0
    ? Math.round((runningPods / totalPods) * 100)
    : 0;

  const filteredPods = pods.filter((pod) => {
    const matchesSearch = pod.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  
    const matchesStatus =
      filterStatus === "All"
        ? true
        : pod.status === filterStatus;
  
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <h1 className="text-5xl font-bold text-cyan-400 mb-10">
        KubeGuardian AI
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

  <div className="bg-slate-900 p-5 rounded-xl border border-slate-700">
    <p className="text-slate-400">Total Pods</p>

    <h2 className="text-4xl font-bold text-cyan-400 mt-2">
      {totalPods}
    </h2>
  </div>

  <div className="bg-slate-900 p-5 rounded-xl border border-slate-700">
    <p className="text-slate-400">Running Pods</p>

    <h2 className="text-4xl font-bold text-green-400 mt-2">
      {runningPods}
    </h2>
  </div>

  <div className="bg-slate-900 p-5 rounded-xl border border-slate-700">
    <p className="text-slate-400">Failed Pods</p>

    <h2 className="text-4xl font-bold text-red-400 mt-2">
      {failedPods}
    </h2>
  </div>

  <div className="bg-slate-900 p-5 rounded-xl border border-slate-700">
    <p className="text-slate-400">Cluster Health</p>

    <h2 className="text-4xl font-bold text-yellow-400 mt-2">
      {healthPercentage}%
    </h2>
  </div>

</div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

  {/* CPU CHART */}
  <div className="bg-slate-900 p-5 rounded-xl border border-slate-700">

    <h2 className="text-xl font-bold text-cyan-400 mb-4">
      CPU Usage
    </h2>

    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={metricsData}>

        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="time" />

        <YAxis />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="cpu"
          stroke="#22d3ee"
          strokeWidth={3}
        />

      </LineChart>
    </ResponsiveContainer>

  </div>

  {/* MEMORY CHART */}
  <div className="bg-slate-900 p-5 rounded-xl border border-slate-700">

    <h2 className="text-xl font-bold text-green-400 mb-4">
      Memory Usage
    </h2>

    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={metricsData}>

        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="time" />

        <YAxis />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="memory"
          stroke="#4ade80"
          strokeWidth={3}
        />

      </LineChart>
    </ResponsiveContainer>

  </div>

</div>

      <h2 className="text-2xl mb-4 font-semibold">
        Kubernetes Pods
      </h2>

      <div className="flex gap-4 mb-6">
  <input
    type="text"
    placeholder="Search pods..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 w-full text-white"
  />

  <select
    value={filterStatus}
    onChange={(e) => setFilterStatus(e.target.value)}
    className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
  >
    <option>All</option>
    <option>Running</option>
    <option>Failed</option>
    <option>Pending</option>
  </select>
</div>

      {loading ? (
        <p>Loading pods...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPods.map((pod, index) => (
            <div
              key={index}
              className="bg-slate-900 p-5 rounded-xl border border-slate-700"
            >
              <div className="flex items-center gap-3">
  <div
    className={`w-3 h-3 rounded-full ${
      pod.status === "Running"
        ? "bg-green-400"
        : pod.status === "Pending"
        ? "bg-yellow-400"
        : "bg-red-500"
    }`}
  ></div>

  <h3 className="text-xl font-bold text-cyan-300">
    {pod.name}
  </h3>
</div>

              <p className="mt-2">
                Namespace:
                <span className="text-green-400 ml-2">
                  {pod.namespace}
                </span>
              </p>

              <p className="mt-1">
                Status:
                <span
                  className={`ml-2 font-bold ${
                    pod.status === "Running"
                     ? "text-green-400"
                     : pod.status === "Pending"
                     ? "text-yellow-400"
                     : "text-red-400"
                  }`}
              >
                  {pod.status}
               </span>
              </p>

              <div className="mt-4">
  {metrics
    .filter((m) => m.name === pod.name)
    .map((metric, idx) => (
      <div key={idx}>
        <p className="text-sm text-cyan-300">
          CPU:
          <span className="ml-2 text-white">
            {metric.cpu_millicores} m
          </span>
        </p>

        <p className="text-sm text-pink-300">
          Memory:
          <span className="ml-2 text-white">
            {metric.memory_mb} MB
          </span>
        </p>
      </div>
    ))}
</div>

              <button
                onClick={() =>
                  analyzePod(pod.name, pod.namespace)
                }
                className="mt-4 bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg font-semibold"
              >
                Analyze with AI
              </button>
            </div>
          ))}
        </div>
      )}

{selectedAnalysis && (
  <div className="mt-10 bg-slate-900 p-6 rounded-xl border border-cyan-500">

    <div className="flex items-center justify-between mb-4">

      <h2 className="text-2xl font-bold text-cyan-400">
        AI Incident Analysis
      </h2>

      <span
        className={`px-4 py-2 rounded-full font-bold ${
          selectedAnalysis.severity === "HIGH"
            ? "bg-red-500"
            : selectedAnalysis.severity === "MEDIUM"
            ? "bg-yellow-500"
            : "bg-green-500"
        }`}
      >
        {selectedAnalysis.severity} SEVERITY
      </span>

    </div>

    <pre className="whitespace-pre-wrap text-sm">
      {selectedAnalysis.text}
    </pre>

  </div>
)}
    </div>
  );
}

export default App;