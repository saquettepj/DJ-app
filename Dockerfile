# Usar Node.js 20 como base (não Alpine para evitar conflitos)
FROM node:20

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Expor porta do Vite
EXPOSE 5173

# Comando para desenvolvimento
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
