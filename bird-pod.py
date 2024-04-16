from flask import Flask, render_template, request, jsonify
from kubernetes import client, config

app = Flask(__name__)

def is_ui_pod(pod):
    return 'birds' in pod.metadata.name.lower()

def is_valid_status(status):
    return status in ['Running']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/pods')
def get_pods():
    config.load_incluster_config()
    v1 = client.CoreV1Api()
    pod_list = v1.list_namespaced_pod(namespace='development').items
    pods = []
    for i, pod in enumerate(pod_list):
        if not is_ui_pod(pod) and is_valid_status(pod.status.phase):  # Exclude UI service pod and check status
            pods.append({
                'name': pod.metadata.name,
                'status': pod.status.phase,
                'color': 'random',  # Placeholder for color (randomize in the frontend)
                'position': i * 50  # Adjust positioning
            })
    return jsonify({'pods': pods})

@app.route('/delete_pod/<pod_name>', methods=['DELETE'])
def delete_pod(pod_name):
    try:
        config.load_incluster_config()
        v1 = client.CoreV1Api()
        v1.delete_namespaced_pod(name=pod_name, namespace='development', body={})
        return jsonify({'message': f'Pod {pod_name} deleted successfully.'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
