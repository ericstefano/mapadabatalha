# Stop all running containers
if [ "$(docker ps -aq)" ]; then
    docker stop $(docker ps -aq)
fi

# Remove all containers
if [ "$(docker ps -aq)" ]; then
    docker rm -f $(docker ps -aq)
fi

# Remove all images
if [ "$(docker images -q)" ]; then
    docker rmi -f $(docker images -q)
fi

# Remove all volumes
if [ "$(docker volume ls -q)" ]; then
    docker volume rm -f $(docker volume ls -q)
fi

# Remove all networks (skip pre-defined ones)
if [ "$(docker network ls -q | grep -v -E 'bridge|host|none')" ]; then
    docker network rm $(docker network ls -q | grep -v -E 'bridge|host|none')
fi

# Clean up unused resources
docker system prune -af --volumes
