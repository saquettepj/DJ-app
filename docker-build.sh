
#!/bin/bash

echo "🚀 Construindo e executando a aplicação DJ com Docker em modo DESENVOLVIMENTO..."

echo "🔑 A API Key será solicitada via interface ao executar a aplicação"
echo "📝 Não é mais necessário configurar arquivos .env"

# Construir a imagem
echo "🔨 Construindo a imagem Docker..."
docker-compose build

# Executar os containers
echo "🚀 Iniciando os containers..."
docker-compose up -d

echo "✅ Aplicação de desenvolvimento iniciada com sucesso!"
echo "🌐 Acesse: http://localhost:5173"
echo ""
echo "📋 Comandos úteis:"
echo "  - Parar: docker-compose down"
echo "  - Logs: docker-compose logs -f"
echo "  - Rebuild: docker-compose up --build"
echo "  - Hot-reload: As alterações no código são aplicadas automaticamente!"
