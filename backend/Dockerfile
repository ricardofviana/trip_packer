FROM python:3.13-alpine3.21
ENV POETRY_VIRTUALENVS_CREATE=false

WORKDIR /app/
COPY . .

RUN sed -i 's/\r$//' /app/entrypoint.sh && chmod +x /app/entrypoint.sh

RUN pip install poetry

RUN poetry config installer.max-workers 10
RUN poetry install --no-interaction --no-ansi --without dev

EXPOSE 8000
CMD [ "poetry", "run", "uvicorn", "trip_packer.app:app", "--host", "0.0.0.0"]
