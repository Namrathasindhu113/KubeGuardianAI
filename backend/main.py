from fastapi import FastAPI, HTTPException, Path, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from kubernetes import client, config
from kubernetes.client.rest import ApiException
from groq import Groq
from dotenv import load_dotenv
import traceback
import os

# Load environment variables
load_dotenv()

# Initialize Groq client
groq_client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

# Create FastAPI app
app = FastAPI(title="KubeGuardian AI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Kubernetes config
try:
    config.load_kube_config()
    kube_config_loaded = True

except Exception as e:
    print("Failed to load Kubernetes config:", e)
    kube_config_loaded = False


# ==========================================
# GET ALL PODS
# ==========================================
@app.get("/pods")
async def get_pods():

    if not kube_config_loaded:
        raise HTTPException(
            status_code=500,
            detail="Kubernetes config not loaded."
        )

    try:
        v1 = client.CoreV1Api()

        pods = v1.list_pod_for_all_namespaces(
            watch=False
        )

        pod_list = []

        for item in pods.items:
            pod_list.append({
                "name": item.metadata.name,
                "namespace": item.metadata.namespace,
                "status": item.status.phase
            })

        return {
            "pods": pod_list
        }

    except ApiException as api_ex:
        traceback.print_exc()

        raise HTTPException(
            status_code=502,
            detail=f"Kubernetes API Error: {api_ex.reason}"
        )

    except Exception as ex:
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(ex)
        )


# ==========================================
# GET POD LOGS
# ==========================================
@app.get("/logs/{pod_name}")
async def get_pod_logs(
    pod_name: str = Path(...),
    namespace: str = Query("default")
):

    try:
        v1 = client.CoreV1Api()

        pod_logs = v1.read_namespaced_pod_log(
            name=pod_name,
            namespace=namespace
        )

        return {
            "pod_name": pod_name,
            "namespace": namespace,
            "logs": pod_logs
        }

    except Exception as ex:
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(ex)
        )


# ==========================================
# AI LOG ANALYSIS
# ==========================================
@app.get("/analyze/{pod_name}")
async def analyze_pod(
    pod_name: str,
    namespace: str = "default"
):

    try:
        v1 = client.CoreV1Api()

        # Fetch logs
        pod_logs = v1.read_namespaced_pod_log(
            name=pod_name,
            namespace=namespace
        )

        # Create AI prompt
        prompt = f"""
You are a Kubernetes DevOps expert.

Analyze these Kubernetes logs.

Explain:
1. What failed
2. Why it failed
3. Suggested fixes
4. Severity level

Keep the explanation beginner friendly.

Logs:
{pod_logs}
"""

        # Send to Groq AI
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        # Extract response
        ai_result = response.choices[0].message.content

        return {
            "pod_name": pod_name,
            "namespace": namespace,
            "analysis": ai_result
        }

    except Exception as ex:
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(ex)
        )

@app.get("/metrics")
async def get_metrics():

    try:
        custom = client.CustomObjectsApi()

        metrics = custom.list_cluster_custom_object(
            group="metrics.k8s.io",
            version="v1beta1",
            plural="pods"
        )

        metric_list = []

        for item in metrics["items"]:

            containers = item["containers"]

            total_cpu = 0
            total_memory = 0

            for container in containers:

                cpu = container["usage"]["cpu"]
                memory = container["usage"]["memory"]

                total_cpu += convert_cpu(cpu)
                total_memory += convert_memory(memory)

            metric_list.append({
                "name": item["metadata"]["name"],
                "namespace": item["metadata"]["namespace"],
                "cpu_millicores": total_cpu,
                "memory_mb": total_memory
            })

        return {"metrics": metric_list}

    except Exception as ex:
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(ex)
        )


# =========================
# CPU CONVERTER
# =========================
def convert_cpu(cpu):

    if cpu.endswith("n"):
        return round(int(cpu[:-1]) / 1000000, 2)

    if cpu.endswith("m"):
        return float(cpu[:-1])

    return float(cpu)


# =========================
# MEMORY CONVERTER
# =========================
def convert_memory(memory):

    if memory.endswith("Ki"):
        return round(int(memory[:-2]) / 1024, 2)

    if memory.endswith("Mi"):
        return float(memory[:-2])

    if memory.endswith("Gi"):
        return float(memory[:-2]) * 1024

    return float(memory)        