docker stop $(docker ps -aq)            # Parar todos os containers
docker rm $(docker ps -aq)              # Remover todos os containers
docker rmi $(docker images -q)          # Remover todas as imagens
docker volume rm $(docker volume ls -q) # Remover todos os volumes
docker network rm $(docker network ls -q) # Remover todas as redes
docker system prune -a --volumes        # Limpeza completa (opcional)
