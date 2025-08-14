# Imagen base de Node
FROM node:22

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el resto del código
COPY . .

# Exponer el puerto definido por la app
EXPOSE 4000

# Comando por defecto
CMD ["node", "server.js"]
