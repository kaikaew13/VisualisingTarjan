# Tarjan Visualiser User Manual

- [Introduction](#introduction)
- [Getting Started](#getting-started)
    - [Accessing the Application](#accessing-the-application)
    - [System Requirements](#system-requirements)
    - [Installation](#installation)
    - [Development](#development)
- [UI Overview](#ui-overview)
    - [Main Interfaces](#main-interfaces)
    - [Graph Visualisation Area](#graph-visualisation-area)
    - [Navigation Menu](#navigation-menu)
    - [Animation Control Panel](#animation-control-panel)
    - [Algorithm Pseudocode](#algorithm-pseudocode)
    - [Results Area](#results-area)
- [Features and Functionality](#features-and-functionality)
    - [Uploading a Graph](#uploading-a-graph)
    - [Finding Strongly Connected Components](#finding-strongly-connected-components)
    - [Solving the All-Different Constraint](#solving-the-all-different-constraint)
    - [Detecting Hamiltonian Circuit Constraints](#detecting-hamiltonian-circuit-constraints)
    - [Displaying Results](#displaying-results)
- [Troubleshooting](#troubleshooting)
    - [Graph not loading](#graph-not-loading)
    - [How to interpret SCC results](#how-to-interpret-scc-results)
    - [Large graph support](#large-graph-support)
- [Support and Contact](#support-and-contact)

## Introduction

This web application provides a visualisation of **Tarjan's Algorithm** and its application in **Constraint Programming**. It is designed for:
- **Finding Strongly Connected Components (SCCs)** in directed graphs.
- **Solving the All-Different Constraint** using SCC decomposition.
- **Checking Hamiltonian Circuit Constraints**.

It can be used by researchers, developers, and students interested in **graph algorithms** or **constraint programming**.

## Getting Started

### Accessing the Application

You can try this application in 2 ways:

1. Try it online (GitHub Pages):
    - Open [Live Demo](https://kaikaew13.github.io/VisualisingTarjan/) in a browser.
    - No installation is required.
2. Run locally:
    - Follow the installation instructions below.

### System Requirements

- **Web Browser**: Chrome, Firefox, Edge, etc.
- **[Node.js](https://nodejs.org/en/download)**

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/kaikaew13/VisualisingTarjan.git
   cd VisualisingTarjan
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```

### Development
**Run the visualisation server:**
  ```base
  npm run dev
  ```

The application will be available at: [http://localhost:5173/VisualisingTarjan/](http://localhost:5173/VisualisingTarjan/)

## UI Overview

### Main Interfaces
The main interfaces consists of the following components:
1. **Graph visualisation area** - Displays the graph and computed SCCs.
2. **Navigation menu** - Constains algorithm options between basic, All-Different and Hamiltonian Cirucuit constraint as well as import graph button and link to GitHub repository.
3. **Animation control panel** - Contains play, pause, next, previous, clear buttons as well as animation speed slider.
4. **Algorithm pseudocode** - Shows Tarjan's Algorithm pseudocode.
5. **Results area** - Displays the result of the constrained graph.

### Graph Visualisation Area
- Displays a directed graph for the basic case.
- Displays a bipartite graph for All-Different constraint case.
- Displays a tree graph for Hamiltonian Circuit constraint case.
- SCCs are color-coded for easy visualisation and interpretation.
- Nodes and edges are highlighted when visited while the animation is playing.

### Navigation Menu
- Import button allows user to upload graph in JSON format.
- Algorithm menu allows user to select an algorithm to compute:
    - Find SCCs
    - Solve All-Different constraints
    - Check Hamiltonian Circuit
- Access GitHub repository via GitHub Logo button.

### Animation Control Panel
- Play/pause graph animation.
- Go to next/previous step in the animation.
- Reset animation to the beginning.
- Adjust animation speed via slider.

### Algorithm Pseudocode
- Describes how Tarjan's Algorithm work.

### Results Area
- Outputs each SCCs.
- For each specific case, also outputs constrained nodes/edges.

## Features and Functionality

### Uploading a Graph
- Click **"Import Data"** button from the Navigation Menu and select a file in JSON format.
- Example JSON format:
    ```json
    {
      "0": {
        "name": "node 0",
        "children": ["1"]
      },
      "1": {
        "name": "node 1",
        "children": ["2"]
      },
      "2": {
        "name": "node 2",
        "children": ["0"]
      },
      "3": {
        "name": "node 3",
        "children": ["1", "2", "4"]
      },
      "4": {
        "name": "node 4",
        "children": ["3", "5"]
      },
      "5": {
        "name": "node 5",
        "children": ["2", "6"]
      },
      "6": {
        "name": "node 6",
        "children": ["5"]
      },
      "7": {
        "name": "node 7",
        "children": ["4", "6"]
      }
    }
    ```
- The file **must strictly** follow this JSON structure for the application to correctly parse the input.

### Finding Strongly Connected Components
- Computes SCCs from a given directed graph.
- Highlights SCCs in different colors.

### Solving the All-Different Constraint
- Find maximum matching in a bipartite graph.
- Computes SCCs.
- Ensures that each right nodes uniquely maps to left nodes.
- Remove any redundant edges for clearer visualisation.

### Detecting Hamiltonian Circuit Constraints
- Displays a graph in tree-like structure.
- Run cases check according to the rules (need to insert picture).

### Displaying Results 
- SCCs are outputted as text on the Results area for easier understanding.
- All-Differents or Hamiltonian Circuit constrained nodes/edges are listed.

## Troubleshooting

### Graph not loading
- Check that the graph input follows the correct format mentioned above.

### How to interpret SCC results
- SCCs are groups of nodes **strongly connected** to each other.
- If a graph is **fully connected**, it has only **one SCC**.

### Large graph support
- Eventhough the Tarjan's Algorithm runs in O(V + E) time complexity, the animation may need more computation and memory.
- Therefore, this application is appropriate for small graphs.

## Support and Contact
For issues or suggestions:
- Open a **GitHub Issue** in this repository.
