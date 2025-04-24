# Build-Stage
FROM node:18-alpine AS build

WORKDIR /app

# Abhängigkeiten installieren
COPY package*.json ./
RUN npm ci

# Quellcode kopieren und Build ausführen
COPY . .
RUN npm run build

# Verzeichnis für AFM-Logs erstellen
RUN mkdir -p /app/dist/AFMlog

# Kopiere Beispiel-CSV-Dateien, falls vorhanden
COPY public/AFMlog/ /app/dist/AFMlog/

# Beispieldateien erstellen, falls keine vorhanden sind
RUN if [ ! "$(ls -A /app/dist/AFMlog)" ]; then \
    echo 'Zeitpunkt,Input,Archiv,Error\n2025-04-24 14:00:00,10,100,1' > /app/dist/AFMlog/AFM_status_log.csv && \
    echo 'Zeitpunkt,Typ,Meldung\n2025-04-24 14:00:00,Warnung,Beispielfehler' > /app/dist/AFMlog/AFM_error_log.csv && \
    echo 'Zeitpunkt,Dateiname,Groesse\n2025-04-24 14:00:00,beispiel.txt,1024' > /app/dist/AFMlog/AFM_input_details.csv && \
    echo 'Zeitpunkt,Muster,Anzahl\n2025-04-24 14:00:00,Muster1,5' > /app/dist/AFMlog/AFM_pattern_matches.csv; \
    fi

# Produktions-Stage
FROM nginx:alpine

# Nginx-Konfiguration für SPA-Routing
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Build-Artefakte kopieren
COPY --from=build /app/dist /usr/share/nginx/html

# Port freigeben
EXPOSE 80

# Gesundheitscheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

# Startbefehl
CMD ["nginx", "-g", "daemon off;"]
