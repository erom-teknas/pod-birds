FROM python
COPY . /opt/
RUN chmod u+x /opt/bird-pod.py
RUN pip install flask kubernetes
EXPOSE 5000
ENTRYPOINT [ "python", "/opt/bird-pod.py" ]