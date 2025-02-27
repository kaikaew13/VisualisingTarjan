# Tarjan Visualiser: Visualising Applications of Tarjan's Algorithm in Constraint Programming

This project implements and visualises applications of **Tarjan's Algorithm** in **Constraint Programming**. It supports:
- **Identifying Strongly Connected Components (SCCs)** in directed graphs.
- **Solving the All-Different Constraint** using SCC decomposition.
- **Checking Hamiltonian Circuit Constraints**.

The application provides **graph-based visualisations** to help users understand, analyse and optimise problem-solving strategies.

## Try It Online

You can try the hosted version of this application without cloning it locally:

[Live Demo on GitHub Pages](https://kaikaew13.github.io/VisualisingTarjan/)

## Installation

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/en/download)

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
## Development

**Run the visualisation server:**
  ```base
  npm run dev
  ```

The application will be available at: [http://localhost:5173/VisualisingTarjan/](http://localhost:5173/VisualisingTarjan/)

## Code Structure

```plaintext
├── src/
│   ├── components/
│   │   ├── graphs/               # React components for directed graph, bigraph and tree graph
│   │   ├── GraphContainer.tsx    # React component for handling Tarjan's Algorithm and displaying graphs
│   │   ├── Pseudocode.tsx        # React component for Tarjan's Algorithm pseudocode
│   │   ├── Result.tsx            # React component for displaying computation results
│   ├── hooks/                    # Customised React hooks
│   ├── context/                  # Customised React context
│   ├── examples/                 # Example of graph inputs in JSON format
│   ├── App.tsx                   # Entry point for running the application
│   ├── utils.ts                  # Helper functions
├── README.md                     # Project README
├── package.json                  # Node.js dependencies
```

## Tech Stack

- **Graph and algorithm processing**: TypeScript
- **Visualisation**: [react-force-graph](https://github.com/vasturiano/react-force-graph) library
- **Frontend**: React and TailwindCSS

## User Manual

Please refer to **User Manual** for detailed usage instruction of the application.

## License

This project is licensed under the **MIT License** - see the [LICENSE](https://github.com/kaikaew13/VisualisingTarjan/blob/main/LICENSE) file for details.
