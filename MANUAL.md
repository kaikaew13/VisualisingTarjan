# Tarjan Visualiser User Manual

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
