package com.ufg.swift.chat.Swift.Chat.presentation.dtos;

import java.util.*;

class Node {
    int x, y;  // Coordenadas do nó
    int g;      // Custo atual do caminho do ponto de início para este nó
    int h;      // Estimativa heurística do custo do caminho deste nó até o destino
    Node parent; // Nó pai

    public Node(int x, int y) {
        this.x = x;
        this.y = y;
        this.g = 0;
        this.h = 0;
        this.parent = null;
    }

    // Função de avaliação f(n) = g(n) + h(n)
    public int getF() {
        return g + h;
    }
}

public class AStar {

    // Defina o grafo, aqui assumimos uma matriz 2D de inteiros para representar o mapa
    private static int[][] graph = {
            {0, 0, 0, 0, 0},
            {0, 1, 1, 0, 0},
            {0, 1, 1, 0, 0},
            {0, 0, 0, 1, 0},
            {0, 0, 0, 1, 0}
    };

    // Função heurística simples (distância Manhattan)
    private static int heuristic(Node current, Node goal) {
        return Math.abs(current.x - goal.x) + Math.abs(current.y - goal.y);
    }

    // Implementação do algoritmo A*
    public static List<Node> aStar(Node start, Node goal) {
        PriorityQueue<Node> openSet = new PriorityQueue<>(Comparator.comparingInt(Node::getF));
        Set<Node> closedSet = new HashSet<>();

        openSet.add(start);

        while (!openSet.isEmpty()) {
            Node current = openSet.poll();

            if (current.equals(goal)) {
                // Chegamos ao destino, reconstruir o caminho
                List<Node> path = new ArrayList<>();
                while (current != null) {
                    path.add(current);
                    current = current.parent;
                }
                Collections.reverse(path);
                return path;
            }

            closedSet.add(current);

            for (Node neighbor : getNeighbors(current)) {
                if (closedSet.contains(neighbor)) {
                    continue; // Já visitado
                }

                int tentativeG = current.g + 1; // Supomos que todas as arestas têm peso 1

                if (!openSet.contains(neighbor) || tentativeG < neighbor.g) {
                    neighbor.g = tentativeG;
                    neighbor.h = heuristic(neighbor, goal);
                    neighbor.parent = current;

                    if (!openSet.contains(neighbor)) {
                        openSet.add(neighbor);
                    }
                }
            }
        }

        return null; // Não há caminho encontrado
    }

    // Função auxiliar para obter vizinhos válidos
    private static List<Node> getNeighbors(Node node) {
        List<Node> neighbors = new ArrayList<>();
        int x = node.x;
        int y = node.y;

        if (x > 0 && graph[x - 1][y] == 0) {
            neighbors.add(new Node(x - 1, y));
        }
        if (x < graph.length - 1 && graph[x + 1][y] == 0) {
            neighbors.add(new Node(x + 1, y));
        }
        if (y > 0 && graph[x][y - 1] == 0) {
            neighbors.add(new Node(x, y - 1));
        }
        if (y < graph[0].length - 1 && graph[x][y + 1] == 0) {
            neighbors.add(new Node(x, y + 1));
        }

        return neighbors;
    }

    public static void main(String[] args) {
        // Criar instâncias de Node para o ponto de início e o destino
        Node start = new Node(0, 0);
        Node goal = new Node(4, 4);

        // Medir o tempo de execução
        long startTime = new Date().getTime();

        // Executar A* e obter o caminho
        List<Node> path = aStar(start, goal);

        // Medir o tempo final
        long endTime = new Date().getTime();
        long executionTime = endTime - startTime;

        // Imprimir o caminho e o tempo de execução
        if (path != null) {
            System.out.println("Caminho encontrado:");
            for (Node node : path) {
                System.out.println("(" + node.x + ", " + node.y + ")");
            }
        } else {
            System.out.println("Não foi possível encontrar um caminho.");
        }

        System.out.println("Tempo de execução: " + executionTime + " milliseconds");
    }

}