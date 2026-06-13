"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Code2, 
  Terminal, 
  Database, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Layers, 
  RefreshCw, 
  ChevronRight, 
  Sliders, 
  Binary, 
  TrendingUp, 
  GitCommit,
  GitBranch,
  Eye,
  Info,
  Maximize2
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// ==========================================
// MOCK DATA & CONSTANTS
// ==========================================

const SAMPLE_ANIMALS = [
  { id: 1, name: "Bruno", breed: "Indie Dog", status: "Critical", reported_at: "2026-06-10" },
  { id: 2, name: "Lucy", breed: "Cat", status: "Stable", reported_at: "2026-06-12" },
  { id: 3, name: "Sheru", breed: "Golden Indie", status: "Critical", reported_at: "2026-06-13" },
  { id: 4, name: "Bella", breed: "Puppy", status: "Minor", reported_at: "2026-06-11" },
];

const SQL_DB = {
  rescue_cases: [
    { id: 1, animal_type: "Dog", location: "Banjara Hills, Hyd", severity: "Critical", reported_at: "2026-06-12" },
    { id: 2, animal_type: "Cat", location: "Secunderabad, Hyd", severity: "Moderate", reported_at: "2026-06-11" },
    { id: 3, animal_type: "Cow", location: "Gachibowli, Hyd", severity: "Critical", reported_at: "2026-06-13" },
    { id: 4, animal_type: "Dog", location: "Whitefield, Blr", severity: "Minor", reported_at: "2026-06-10" },
    { id: 5, animal_type: "Cat", location: "Koramangala, Blr", severity: "Critical", reported_at: "2026-06-09" }
  ],
  volunteers: [
    { id: 101, name: "Aarav Sharma", alert_zone: "Banjara Hills, Hyd", active: 1 },
    { id: 102, name: "Ananya Rao", alert_zone: "Whitefield, Blr", active: 1 },
    { id: 103, name: "Rahul Verma", alert_zone: "Secunderabad, Hyd", active: 0 }
  ]
};

// ==========================================
// CUSTOM COMPILERS & UTILITIES
// ==========================================

function transpileJSX(code: string): string {
  // Strip imports and exports
  let js = code
    .replace(/import\s+.*?;?/g, "")
    .replace(/export\s+default\s+/g, "")
    .trim();

  // Replace standard class with className
  js = js.replace(/class=/g, "className=");

  let hasJsx = true;
  let iterations = 0;
  
  // Custom JSX transpiler
  while (hasJsx && iterations < 40) {
    const prev = js;
    
    // Transpile self-closing tags: <tag key="val" />
    js = js.replace(/<([a-zA-Z0-9]+)([^>]*)\/>/g, (_, tag, attrs) => {
      const parsedAttrs = parseProps(attrs);
      return `React.createElement("${tag}", ${parsedAttrs})`;
    });

    // Transpile simple tag with text/children: <tag attrs>content</tag>
    js = js.replace(/<([a-zA-Z0-9]+)([^>]*)>([^<]*?)<\/\1>/g, (_, tag, attrs, content) => {
      const parsedAttrs = parseProps(attrs);
      const child = parseChild(content);
      return `React.createElement("${tag}", ${parsedAttrs}, ${child})`;
    });

    // Transpile nested tags once inner elements are resolved
    if (js === prev) {
      js = js.replace(/<([a-zA-Z0-9]+)([^>]*)>([\s\S]*?)<\/\1>/g, (_, tag, attrs, content) => {
        if (content.includes("<") && !content.includes("React.createElement")) {
          return _; // Skip till children are evaluated
        }
        const parsedAttrs = parseProps(attrs);
        const children = content.trim();
        return `React.createElement("${tag}", ${parsedAttrs}, ${children})`;
      });
    }

    // Insert commas between adjacent React.createElement expressions
    js = js.replace(/(React\.createElement\(.*?\))\s+(React\.createElement\(.*?\))/g, "$1, $2");

    if (js === prev) {
      hasJsx = false;
    }
    iterations++;
  }
  return js;
}

function parseProps(attrsStr: string): string {
  if (!attrsStr || attrsStr.trim() === "") return "null";
  const props: Record<string, string> = {};
  const regex = /([a-zA-Z0-9_-]+)\s*=\s*(?:(?:"([^"]*)")|(?:'([^']*)')|(?:\{([\s\S]*?)\}))/g;
  let match;
  let hasProps = false;
  
  while ((match = regex.exec(attrsStr)) !== null) {
    hasProps = true;
    const name = match[1];
    const val = match[2] || match[3] || match[4];
    if (match[4] !== undefined) {
      props[name] = `__EXPR__:${val}`;
    } else {
      props[name] = val;
    }
  }
  if (!hasProps) return "null";
  
  let json = JSON.stringify(props);
  json = json.replace(/"__EXPR__:(.*?)"/g, (_, expr) => {
    return expr.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  });
  return json;
}

function parseChild(childStr: string): string {
  const trimmed = childStr.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed.slice(1, -1);
  }
  return JSON.stringify(trimmed);
}

// SQL Engine Parser Mock
function evaluateMockSQL(query: string) {
  try {
    const q = query.trim().replace(/;\s*$/, "").replace(/\s+/g, " ");
    const selectMatch = q.match(/^SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+JOIN\s+(\w+)\s+ON\s+(.+?))?(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?$/i);
    
    if (!selectMatch) {
      return { error: "SQL Syntax Error. Supported structure: SELECT columns FROM table [JOIN table2 ON col1=col2] [WHERE condition] [ORDER BY col]" };
    }

    const colsStr = selectMatch[1].trim();
    const table1Name = selectMatch[2].trim();
    const joinTable = selectMatch[3] ? selectMatch[3].trim() : null;
    const joinOn = selectMatch[4] ? selectMatch[4].trim() : null;
    const whereStr = selectMatch[5] ? selectMatch[5].trim() : null;
    const orderByStr = selectMatch[6] ? selectMatch[6].trim() : null;

    if (!(table1Name in SQL_DB)) {
      return { error: `Table '${table1Name}' not found.` };
    }

    let dataset = JSON.parse(JSON.stringify(SQL_DB[table1Name as keyof typeof SQL_DB]));

    // Join
    if (joinTable && joinOn) {
      if (!(joinTable in SQL_DB)) {
        return { error: `Table '${joinTable}' not found for JOIN.` };
      }
      const dataset2 = SQL_DB[joinTable as keyof typeof SQL_DB];
      const [t1Key, t2Key] = joinOn.split("=").map(s => s.trim());
      const key1 = t1Key.split(".")[1] || t1Key;
      const key2 = t2Key.split(".")[1] || t2Key;

      const joined: any[] = [];
      dataset.forEach((row1: any) => {
        dataset2.forEach((row2: any) => {
          if (String(row1[key1]) === String(row2[key2])) {
            joined.push({ ...row1, ...row2 });
          }
        });
      });
      dataset = joined;
    }

    // Where filter
    if (whereStr) {
      const matchEquals = whereStr.match(/([\w.]+)\s*=\s*(['"])(.*?)\2/i);
      const matchLike = whereStr.match(/([\w.]+)\s+LIKE\s+(['"])(.*?)\2/i);

      if (matchEquals) {
        const col = matchEquals[1].split(".")[1] || matchEquals[1];
        const val = matchEquals[3];
        dataset = dataset.filter((row: any) => String(row[col]) === val);
      } else if (matchLike) {
        const col = matchLike[1].split(".")[1] || matchLike[1];
        let term = matchLike[3].replace(/%/g, "");
        dataset = dataset.filter((row: any) => String(row[col]).toLowerCase().includes(term.toLowerCase()));
      } else {
        return { error: "Unsupported WHERE filter logic. Use basic '=' or 'LIKE' operators." };
      }
    }

    // Order By
    if (orderByStr) {
      const parts = orderByStr.split(" ");
      const col = parts[0].split(".")[1] || parts[0];
      const isDesc = parts[1] && parts[1].toUpperCase() === "DESC";

      dataset.sort((a: any, b: any) => {
        const valA = a[col];
        const valB = b[col];
        if (typeof valA === "number" && typeof valB === "number") {
          return isDesc ? valB - valA : valA - valB;
        }
        return isDesc 
          ? String(valB).localeCompare(String(valA)) 
          : String(valA).localeCompare(String(valB));
      });
    }

    // Column projection
    let result = dataset;
    if (colsStr !== "*") {
      const cols = colsStr.split(",").map(c => c.trim().split(".")[1] || c.trim());
      result = dataset.map((row: any) => {
        const filteredRow: any = {};
        cols.forEach(c => {
          filteredRow[c] = row[c] !== undefined ? row[c] : null;
        });
        return filteredRow;
      });
    }

    return { data: result };
  } catch (err: any) {
    return { error: err.message || "Unknown database error execution." };
  }
}

// ==========================================
// BST Tree Implementation Structure
// ==========================================
class BSTNode {
  val: number;
  left: BSTNode | null = null;
  right: BSTNode | null = null;
  x: number = 0;
  y: number = 0;

  constructor(val: number) {
    this.val = val;
  }
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function DevLabPage() {
  const [activeTab, setActiveTab] = useState<"css" | "js" | "react" | "sql" | "dsa">("css");

  // --- CSS Sandbox State ---
  const [cssCode, setCssCode] = useState<string>(
`.rescue-card {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(102, 187, 106, 0.4);
  border-radius: 16px;
  padding: 24px;
  gap: 16px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}`
  );
  const [cssPassChecks, setCssPassChecks] = useState({
    flex: false,
    radius: false,
    blur: false,
    glass: false,
  });

  useEffect(() => {
    const hasFlex = /display\s*:\s*(flex|grid)/i.test(cssCode);
    const hasRadius = /border-radius\s*:\s*(\d{2,})px/i.test(cssCode);
    const hasBlur = /backdrop-filter\s*:\s*blur/i.test(cssCode);
    const hasGlass = /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(0\.\d+|0)\)/i.test(cssCode) || /hsla\(/i.test(cssCode);

    setCssPassChecks({
      flex: hasFlex,
      radius: hasRadius,
      blur: hasBlur,
      glass: hasGlass,
    });
  }, [cssCode]);

  // --- JS Playground State ---
  const [jsCode, setJsCode] = useState<string>(
`// Filter animals with 'Critical' status and return names sorted alphabetically
function getCriticalAnimals(animals) {
  // Write your code here
  return animals
    .filter(a => a.status === 'Critical')
    .map(a => a.name)
    .sort();
}`
  );
  const [jsOutput, setJsOutput] = useState<string>("");
  const [jsSuccess, setJsSuccess] = useState<boolean | null>(null);

  const runJSCode = () => {
    try {
      setJsOutput("Compiling script...\n");
      const cleanCode = jsCode + "\n return getCriticalAnimals;";
      const userFn = new Function(cleanCode)();
      
      if (typeof userFn !== "function") {
        throw new Error("getCriticalAnimals is not a function.");
      }

      setJsOutput(prev => prev + "Running unit tests with mock rescue data...\n");
      const result = userFn(SAMPLE_ANIMALS);
      
      const logOutput = `Output returned: ${JSON.stringify(result, null, 2)}\n`;
      setJsOutput(prev => prev + logOutput);

      // Verify assertion: should be ["Bruno", "Sheru"] (sorted alphabetically)
      const passed = Array.isArray(result) && 
                     result.length === 2 && 
                     result[0] === "Bruno" && 
                     result[1] === "Sheru";

      if (passed) {
        setJsOutput(prev => prev + "✓ SUCCESS: All test assertions passed!");
        setJsSuccess(true);
      } else {
        setJsOutput(prev => prev + "✗ FAIL: Expected output to be ['Bruno', 'Sheru']");
        setJsSuccess(false);
      }
    } catch (err: any) {
      setJsOutput(prev => prev + `Error: ${err.message}`);
      setJsSuccess(false);
    }
  };

  // --- React Sandbox State ---
  const [reactCode, setReactCode] = useState<string>(
`function AlertCounter() {
  const [count, setCount] = useState(5);
  
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h3 style={{ margin: "0 0 12px", color: "#66BB6A" }}>
        Active Rescues: {count}
      </h3>
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          background: "linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          boxShadow: "0 4px 10px rgba(76, 175, 80, 0.3)"
        }}
      >
        🚨 Dispatch Ambulance
      </button>
    </div>
  );
}`
  );
  const [reactCompiledComp, setReactCompiledComp] = useState<React.ComponentType | null>(null);
  const [reactError, setReactError] = useState<string | null>(null);

  const compileReactCode = () => {
    try {
      setReactError(null);
      const transpiled = transpileJSX(reactCode);
      
      // Inject React standard hooks in lexical evaluation scope
      const componentCreator = new Function(
        "React", "useState", "useEffect",
        `
        ${transpiled}
        // Return the parsed component function
        const match = \`${transpiled}\`.match(/function\\s+([a-zA-Z0-9_]+)/);
        if (match && match[1]) {
          return eval(match[1]);
        }
        throw new Error("Could not find component function declaration.");
        `
      );

      const component = componentCreator(React, useState, useEffect);
      setReactCompiledComp(() => component);
    } catch (err: any) {
      setReactError(err.message || "Failed to render React component.");
      setReactCompiledComp(null);
    }
  };

  useEffect(() => {
    compileReactCode();
  }, [reactCode]);

  // --- SQL Console State ---
  const [sqlQuery, setSqlQuery] = useState<string>(
    "SELECT * FROM rescue_cases WHERE severity = 'Critical' ORDER BY reported_at DESC;"
  );
  const [sqlResult, setSqlResult] = useState<any[] | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);

  const executeSQL = () => {
    setSqlError(null);
    setSqlResult(null);
    const result = evaluateMockSQL(sqlQuery);
    if (result.error) {
      setSqlError(result.error);
    } else {
      setSqlResult(result.data || []);
    }
  };

  // --- DSA Visualizer State ---
  const [dsaModule, setDsaModule] = useState<"path" | "sort" | "bst">("path");
  const [dsaSpeed, setDsaSpeed] = useState<number>(300); // ms

  // BFS / DFS Grid Pathfinding
  const gridRows = 8;
  const gridCols = 8;
  const [grid, setGrid] = useState<string[][]>([]); // 'empty', 'wall', 'start', 'target', 'visited', 'path'
  const [isPathfinding, setIsPathfinding] = useState<boolean>(false);
  
  const initGrid = () => {
    const defaultGrid = Array(gridRows).fill(null).map(() => Array(gridCols).fill("empty"));
    defaultGrid[0][0] = "start";
    defaultGrid[7][7] = "target";
    // Set some default obstacles
    defaultGrid[2][2] = "wall";
    defaultGrid[2][3] = "wall";
    defaultGrid[3][3] = "wall";
    defaultGrid[4][3] = "wall";
    defaultGrid[5][5] = "wall";
    defaultGrid[6][5] = "wall";
    setGrid(defaultGrid);
  };

  useEffect(() => {
    initGrid();
  }, []);

  const runPathfinder = async (algo: "bfs" | "dfs") => {
    if (isPathfinding) return;
    setIsPathfinding(true);
    
    // Reset path/visited status on the grid
    const tempGrid = grid.map(row => row.map(cell => (cell === "visited" || cell === "path") ? "empty" : cell));
    setGrid(tempGrid);

    const startNode = [0, 0];
    const targetNode = [7, 7];
    const queue: number[][] = [startNode];
    const visitedSet = new Set<string>();
    const parentMap = new Map<string, string>();
    
    visitedSet.add("0,0");

    let found = false;
    const directions = [
      [0, 1],  // Right
      [1, 0],  // Down
      [0, -1], // Left
      [-1, 0]  // Up
    ];

    while (queue.length > 0) {
      // Dequeue (BFS) or Pop (DFS)
      const current = algo === "bfs" ? queue.shift()! : queue.pop()!;
      const [r, c] = current;

      if (r === targetNode[0] && c === targetNode[1]) {
        found = true;
        break;
      }

      // Visual exploration delay
      if (!(r === 0 && c === 0)) {
        await new Promise(resolve => setTimeout(resolve, dsaSpeed));
        setGrid(prev => {
          const next = [...prev];
          if (next[r][c] === "empty") next[r][c] = "visited";
          return next;
        });
      }

      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        const posKey = `${nr},${nc}`;

        if (nr >= 0 && nr < gridRows && nc >= 0 && nc < gridCols) {
          const cellType = tempGrid[nr][nc];
          if (cellType !== "wall" && !visitedSet.has(posKey)) {
            visitedSet.add(posKey);
            parentMap.set(posKey, `${r},${c}`);
            queue.push([nr, nc]);
          }
        }
      }
    }

    if (found) {
      // Trace path
      let currKey = "7,7";
      const pathNodes: string[] = [];
      while (parentMap.has(currKey)) {
        currKey = parentMap.get(currKey)!;
        if (currKey !== "0,0") {
          pathNodes.push(currKey);
        }
      }
      
      // Animate shortest path
      for (let i = pathNodes.length - 1; i >= 0; i--) {
        const [pr, pc] = pathNodes[i].split(",").map(Number);
        await new Promise(resolve => setTimeout(resolve, 80));
        setGrid(prev => {
          const next = [...prev];
          next[pr][pc] = "path";
          return next;
        });
      }
    } else {
      alert("No path found! The rescue ambulance is blocked.");
    }
    setIsPathfinding(false);
  };

  // Urgency Bars Sorting
  const [sortingArray, setSortingArray] = useState<{ val: number; state: "default" | "compare" | "swap" | "sorted" }[]>([]);
  const [isSorting, setIsSorting] = useState<boolean>(false);
  const [sortMetrics, setSortMetrics] = useState({ compares: 0, swaps: 0 });

  const initSortArray = () => {
    const arr = [45, 12, 85, 32, 72, 28, 90, 50, 64];
    setSortingArray(arr.map(v => ({ val: v, state: "default" })));
    setSortMetrics({ compares: 0, swaps: 0 });
  };

  useEffect(() => {
    initSortArray();
  }, []);

  const runBubbleSort = async () => {
    if (isSorting) return;
    setIsSorting(true);
    let arr = [...sortingArray];
    let compares = 0;
    let swaps = 0;
    
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        // Highlight compare nodes
        arr[j].state = "compare";
        arr[j+1].state = "compare";
        setSortingArray([...arr]);
        compares++;
        setSortMetrics({ compares, swaps });
        await new Promise(resolve => setTimeout(resolve, dsaSpeed));

        if (arr[j].val > arr[j+1].val) {
          arr[j].state = "swap";
          arr[j+1].state = "swap";
          setSortingArray([...arr]);
          swaps++;
          setSortMetrics({ compares, swaps });
          await new Promise(resolve => setTimeout(resolve, dsaSpeed));
          
          // Swap values
          const temp = arr[j].val;
          arr[j].val = arr[j+1].val;
          arr[j+1].val = temp;
        }

        arr[j].state = "default";
        arr[j+1].state = "default";
      }
      arr[arr.length - i - 1].state = "sorted";
      setSortingArray([...arr]);
    }
    
    // Mark remaining sorted
    arr.forEach(item => item.state = "sorted");
    setSortingArray([...arr]);
    setIsSorting(false);
  };

  // BST Binary Search Tree Node Insert Visualizer
  const [bstRoot, setBstRoot] = useState<BSTNode | null>(null);
  const [bstInput, setBstInput] = useState<string>("50");
  const [bstMsg, setBstMsg] = useState<string>("Enter a key to start inserting nodes into the tree.");
  const [bstActiveNodeVal, setBstActiveNodeVal] = useState<number | null>(null);

  const calculateTreeLayout = (node: BSTNode | null, x: number, y: number, spread: number) => {
    if (!node) return;
    node.x = x;
    node.y = y;
    calculateTreeLayout(node.left, x - spread, y + 60, spread * 0.5);
    calculateTreeLayout(node.right, x + spread, y + 60, spread * 0.5);
  };

  const insertBSTNode = async () => {
    const val = parseInt(bstInput);
    if (isNaN(val)) return;
    setBstInput("");

    if (!bstRoot) {
      const newRoot = new BSTNode(val);
      calculateTreeLayout(newRoot, 250, 40, 100);
      setBstRoot(newRoot);
      setBstMsg(`Created BST root node with value: ${val}`);
      return;
    }

    setBstMsg(`Searching insertion slot for node ${val}...`);
    let curr = bstRoot;
    let parent: BSTNode | null = null;
    
    while (curr) {
      setBstActiveNodeVal(curr.val);
      await new Promise(resolve => setTimeout(resolve, dsaSpeed));
      
      if (val < curr.val) {
        setBstMsg(`${val} < ${curr.val}. Moving down LEFT subtree.`);
        parent = curr;
        if (!curr.left) {
          curr.left = new BSTNode(val);
          break;
        }
        curr = curr.left;
      } else if (val > curr.val) {
        setBstMsg(`${val} > ${curr.val}. Moving down RIGHT subtree.`);
        parent = curr;
        if (!curr.right) {
          curr.right = new BSTNode(val);
          break;
        }
        curr = curr.right;
      } else {
        setBstMsg(`Value ${val} already exists in the tree!`);
        setBstActiveNodeVal(null);
        return;
      }
    }
    
    setBstActiveNodeVal(null);
    const nextRoot = { ...bstRoot };
    calculateTreeLayout(nextRoot, 250, 40, 100);
    setBstRoot(nextRoot);
    setBstMsg(`Successfully inserted node ${val} into the tree.`);
  };

  return (
    <div style={{ background: "#050f07", minHeight: "100vh", color: "#FFFFFF", fontFamily: "var(--font-sans), sans-serif" }}>
      <Navbar />

      {/* Header Panel */}
      <div 
        style={{
          background: "linear-gradient(180deg, rgba(46, 125, 50, 0.15) 0%, rgba(5, 15, 7, 0) 100%)",
          padding: "120px 24px 40px",
          textAlign: "center"
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <span 
            style={{
              background: "rgba(102, 187, 106, 0.1)",
              border: "1px solid rgba(102, 187, 106, 0.3)",
              color: "#A5D6A7",
              padding: "6px 14px",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase"
            }}
          >
            💻 EcoVerse Academy
          </span>
          <h1 
            style={{ 
              fontSize: "clamp(2.2rem, 5vw, 3.8rem)", 
              fontWeight: 900, 
              marginTop: "16px", 
              marginBottom: "12px", 
              lineHeight: 1.1,
              letterSpacing: "-0.03em"
            }}
          >
            Developer Training <span className="text-gradient">DevLab</span>
          </h1>
          <p style={{ color: "rgba(232, 245, 233, 0.7)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>
            Master software engineering concepts while building features for EcoVerse. Run compilers, test code, run queries, and explore graph routing.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 80px" }}>
        
        {/* Navigation Tabs */}
        <div 
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            borderBottom: "1px solid rgba(102, 187, 106, 0.15)",
            paddingBottom: "16px",
            marginBottom: "36px",
            flexWrap: "wrap"
          }}
        >
          {[
            { id: "css", label: "🎨 CSS Sandbox", icon: Layers },
            { id: "js", label: "⚡ JS Executor", icon: Terminal },
            { id: "react", label: "⚛️ React Builder", icon: Code2 },
            { id: "sql", label: "🗄️ SQL Console", icon: Database },
            { id: "dsa", label: "📈 DSA Visuals", icon: Binary },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  background: isActive ? "rgba(102, 187, 106, 0.15)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(102, 187, 106, 0.3)" : "transparent"}`,
                  color: isActive ? "#A5D6A7" : "rgba(255, 255, 255, 0.6)",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease"
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ==========================================
            TAB CONTENT: CSS SANDBOX
            ========================================== */}
        {activeTab === "css" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
            
            {/* Editor panel */}
            <div className="glass-dark" style={{ borderRadius: "16px", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Code2 color="#66BB6A" size={20} /> CSS Style Editor
                </h3>
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>styles.css</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: "16px" }}>
                Task: Complete the glassmorphism parameters below to build an elegant Centered Rescue Alert card.
              </p>
              <textarea
                value={cssCode}
                onChange={e => setCssCode(e.target.value)}
                style={{
                  width: "100%",
                  height: "280px",
                  background: "rgba(10, 16, 11, 0.8)",
                  border: "1px solid rgba(102, 187, 106, 0.2)",
                  borderRadius: "8px",
                  padding: "12px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  color: "#A5D6A7",
                  outline: "none",
                  resize: "none",
                  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)"
                }}
              />
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
                  {cssPassChecks.flex ? <CheckCircle size={14} color="#66BB6A" /> : <AlertCircle size={14} color="#EF5350" />}
                  <span>Uses Flexbox or Grid mapping layout</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
                  {cssPassChecks.radius ? <CheckCircle size={14} color="#66BB6A" /> : <AlertCircle size={14} color="#EF5350" />}
                  <span>Has rounded corners (`border-radius &ge; 12px`)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
                  {cssPassChecks.blur ? <CheckCircle size={14} color="#66BB6A" /> : <AlertCircle size={14} color="#EF5350" />}
                  <span>Includes backdrop-filter blur parameters</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
                  {cssPassChecks.glass ? <CheckCircle size={14} color="#66BB6A" /> : <AlertCircle size={14} color="#EF5350" />}
                  <span>Specifies low-opacity alpha colors (rgba/hsla)</span>
                </div>
              </div>
            </div>

            {/* Live Style Preview Output */}
            <div 
              className="glass-dark" 
              style={{ 
                borderRadius: "16px", 
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                minHeight: "400px"
              }}
            >
              <div style={{ position: "absolute", top: "16px", left: "20px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Eye size={16} color="rgba(255,255,255,0.4)" />
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontWeight: "bold", textTransform: "uppercase" }}>Live Canvas Rendering</span>
              </div>
              
              {/* Inject scoped dynamic style block */}
              <style dangerouslySetInnerHTML={{ __html: cssCode.replace(/\.rescue-card/g, ".devlab-card-preview") }} />
              
              <div className="devlab-card-preview" style={{ maxWidth: "340px", width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ background: "rgba(211,47,47,0.15)", color: "#EF5350", padding: "4px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "bold" }}>
                    🚨 CRITICAL SOS
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>Hyderabad</span>
                </div>
                <h4 style={{ margin: "0 0 4px", fontSize: "1.1rem" }}>Injured Indie Pup</h4>
                <p style={{ margin: "0 0 12px", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
                  Spotted near Road No 4, Banjara Hills. Requires immediate leg bandaging and transportation.
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={{ flex: 1, background: "rgba(102,187,106,0.12)", border: "1px solid rgba(102,187,106,0.3)", color: "#A5D6A7", padding: "8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "bold", cursor: "pointer" }}>
                    Accept Alert
                  </button>
                  <button style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "8px", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer" }}>
                    Call Feeder
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            TAB CONTENT: JS EXECUTOR
            ========================================== */}
        {activeTab === "js" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
            
            {/* JS Editor */}
            <div className="glass-dark" style={{ borderRadius: "16px", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Terminal color="#66BB6A" size={20} /> JS Array Processor
                </h3>
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>processor.js</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: "16px" }}>
                Task: Implement the logic inside the function to filter animals with status <strong style={{color:"#EF5350"}}>'Critical'</strong> and sort them alphabetically.
              </p>
              <textarea
                value={jsCode}
                onChange={e => setJsCode(e.target.value)}
                style={{
                  width: "100%",
                  height: "260px",
                  background: "rgba(10, 16, 11, 0.8)",
                  border: "1px solid rgba(102, 187, 106, 0.2)",
                  borderRadius: "8px",
                  padding: "12px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  color: "#A5D6A7",
                  outline: "none",
                  resize: "none",
                  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)"
                }}
              />
              <button 
                onClick={runJSCode}
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "16px", padding: "12px 24px" }}
              >
                <Play size={14} /> Run Console Sandbox Tests
              </button>
            </div>

            {/* Hacker Terminal Output console */}
            <div className="glass-dark" style={{ borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#EF5350" }} />
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#F57C00" }} />
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#388E3C" }} />
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginLeft: "8px" }}>Console log output</span>
              </div>
              <div 
                style={{ 
                  flex: 1, 
                  background: "#0a100b", 
                  borderRadius: "8px", 
                  padding: "16px", 
                  fontFamily: "var(--font-mono)", 
                  fontSize: "0.85rem", 
                  color: jsSuccess === true ? "#A5D6A7" : jsSuccess === false ? "#FFCDD2" : "rgba(255,255,255,0.6)",
                  whiteSpace: "pre-line",
                  overflowY: "auto",
                  minHeight: "220px",
                  border: "1px solid rgba(102, 187, 106, 0.1)"
                }}
              >
                {jsOutput || "Awaiting code execution run..."}
              </div>
              {jsSuccess !== null && (
                <div 
                  style={{ 
                    marginTop: "16px", 
                    padding: "12px", 
                    borderRadius: "6px", 
                    background: jsSuccess ? "rgba(56, 142, 60, 0.15)" : "rgba(211, 47, 47, 0.15)",
                    border: `1px solid ${jsSuccess ? "rgba(102, 187, 106, 0.3)" : "rgba(239, 83, 80, 0.3)"}`,
                    color: jsSuccess ? "#A5D6A7" : "#FFCDD2",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  {jsSuccess ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span>{jsSuccess ? "Assigned task complete! Dynamic logic is working correctly." : "Code did not produce expected results. Adjust parameters and test again."}</span>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==========================================
            TAB CONTENT: REACT BUILDER
            ========================================== */}
        {activeTab === "react" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
            
            {/* React Editor */}
            <div className="glass-dark" style={{ borderRadius: "16px", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Code2 color="#66BB6A" size={20} /> React Component Builder
                </h3>
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>AlertCounter.jsx</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: "16px" }}>
                Modify the React component script. Custom buttons will render dynamically inside the virtual viewport phone preview.
              </p>
              <textarea
                value={reactCode}
                onChange={e => setReactCode(e.target.value)}
                style={{
                  width: "100%",
                  height: "300px",
                  background: "rgba(10, 16, 11, 0.8)",
                  border: "1px solid rgba(102, 187, 106, 0.2)",
                  borderRadius: "8px",
                  padding: "12px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  color: "#A5D6A7",
                  outline: "none",
                  resize: "none",
                  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)"
                }}
              />
            </div>

            {/* Mobile Viewport Render Simulator */}
            <div 
              className="glass-dark" 
              style={{ 
                borderRadius: "16px", 
                padding: "24px", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center",
                minHeight: "450px"
              }}
            >
              {/* Virtual phone shell */}
              <div 
                style={{
                  width: "280px",
                  height: "380px",
                  background: "#080c09",
                  border: "8px solid #203424",
                  borderRadius: "32px",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
                  overflow: "hidden"
                }}
              >
                {/* Camera Notch */}
                <div style={{ position: "absolute", top: "0", left: "50%", transform: "translateX(-50%)", width: "110px", height: "18px", background: "#203424", borderBottomLeftRadius: "12px", borderBottomRightRadius: "12px", zIndex: 10 }} />
                
                {/* Virtual Content Panel */}
                <div style={{ flex: 1, padding: "30px 16px 16px", overflowY: "auto" }}>
                  {reactError ? (
                    <div style={{ color: "#EF5350", fontSize: "0.8rem", padding: "10px", fontFamily: "var(--font-mono)" }}>
                      <AlertCircle size={16} style={{ marginBottom: "6px" }} />
                      <strong>Component Compilation Error:</strong>
                      <p style={{ margin: "4px 0 0", color: "#FFCDD2" }}>{reactError}</p>
                    </div>
                  ) : reactCompiledComp ? (
                    React.createElement(reactCompiledComp)
                  ) : (
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", textAlign: "center", marginTop: "120px" }}>
                      Loading component canvas preview...
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            TAB CONTENT: SQL CONSOLE
            ========================================== */}
        {activeTab === "sql" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
            
            {/* Database schema layout */}
            <div className="glass-dark" style={{ borderRadius: "16px", padding: "24px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <Database color="#66BB6A" size={20} /> SQL Query console
              </h3>
              
              {/* Schema layout visualizer */}
              <div style={{ marginBottom: "20px" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "bold" }}>RELATIONAL SCHEMA DEFINITION</span>
                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  
                  {/* Table 1 schema */}
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(102,187,106,0.15)", borderRadius: "6px", padding: "10px" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#A5D6A7", borderBottom: "1px solid rgba(102,187,106,0.15)", paddingBottom: "4px", marginBottom: "4px" }}>
                      rescue_cases
                    </div>
                    <ul style={{ listStyle: "none", fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", padding: 0 }}>
                      <li>id (INT)</li>
                      <li>animal_type (TEXT)</li>
                      <li>location (TEXT)</li>
                      <li>severity (TEXT)</li>
                      <li>reported_at (DATE)</li>
                    </ul>
                  </div>

                  {/* Table 2 schema */}
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(102,187,106,0.15)", borderRadius: "6px", padding: "10px" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#A5D6A7", borderBottom: "1px solid rgba(102,187,106,0.15)", paddingBottom: "4px", marginBottom: "4px" }}>
                      volunteers
                    </div>
                    <ul style={{ listStyle: "none", fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", padding: 0 }}>
                      <li>id (INT)</li>
                      <li>name (TEXT)</li>
                      <li>alert_zone (TEXT)</li>
                      <li>active (INT)</li>
                    </ul>
                  </div>

                </div>
              </div>

              <textarea
                value={sqlQuery}
                onChange={e => setSqlQuery(e.target.value)}
                style={{
                  width: "100%",
                  height: "140px",
                  background: "rgba(10, 16, 11, 0.8)",
                  border: "1px solid rgba(102, 187, 106, 0.2)",
                  borderRadius: "8px",
                  padding: "12px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  color: "#A5D6A7",
                  outline: "none",
                  resize: "none",
                  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)"
                }}
              />
              
              <button 
                onClick={executeSQL}
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "16px", padding: "12px 24px" }}
              >
                <Play size={14} /> Run Query
              </button>
            </div>

            {/* SQL Table output result */}
            <div className="glass-dark" style={{ borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", overflowX: "auto" }}>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "bold", marginBottom: "12px" }}>
                QUERY DATASHEET RESULTS
              </span>
              
              {sqlError ? (
                <div style={{ color: "#EF5350", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
                  <AlertCircle size={16} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
                  {sqlError}
                </div>
              ) : sqlResult ? (
                sqlResult.length === 0 ? (
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", padding: "20px 0" }}>
                    Query executed successfully. 0 rows returned.
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(102,187,106,0.3)" }}>
                        {Object.keys(sqlResult[0]).map(col => (
                          <th key={col} style={{ padding: "8px", color: "#A5D6A7", fontWeight: "bold" }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sqlResult.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                          {Object.values(row).map((val: any, cIdx) => (
                            <td key={cIdx} style={{ padding: "8px", color: "rgba(255,255,255,0.8)" }}>
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : (
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", padding: "20px 0" }}>
                  Awaiting query execution output...
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==========================================
            TAB CONTENT: DSA VISUALS
            ========================================== */}
        {activeTab === "dsa" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Visualizer selector */}
            <div 
              style={{
                display: "flex",
                gap: "12px",
                borderBottom: "1px solid rgba(102, 187, 106, 0.1)",
                paddingBottom: "12px"
              }}
            >
              {[
                { id: "path", label: "🧭 Pathfinding Routing", desc: "BFS / DFS Search on Ambulance Grids" },
                { id: "sort", label: "📊 Sorting Columns", desc: "Bubble Urgency Weights Sorters" },
                { id: "bst", label: "🌲 Binary Search Trees", desc: "Visual Node Insert Traversal" }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setDsaModule(sub.id as any)}
                  style={{
                    background: dsaModule === sub.id ? "rgba(102, 187, 106, 0.1)" : "transparent",
                    border: `1px solid ${dsaModule === sub.id ? "rgba(102, 187, 106, 0.2)" : "transparent"}`,
                    color: dsaModule === sub.id ? "#A5D6A7" : "rgba(255,255,255,0.5)",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    textAlign: "left",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>{sub.label}</div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", fontWeight: "normal" }}>{sub.desc}</div>
                </button>
              ))}
            </div>

            {/* Speeds and Controls Panel */}
            <div 
              className="glass-dark" 
              style={{ 
                borderRadius: "12px", 
                padding: "16px", 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Sliders size={16} color="#A5D6A7" />
                <span style={{ fontSize: "0.85rem" }}>Traversal Step Delay: {dsaSpeed}ms</span>
                <input 
                  type="range" 
                  min="50" 
                  max="1000" 
                  step="50"
                  value={dsaSpeed} 
                  onChange={e => setDsaSpeed(Number(e.target.value))}
                  style={{ 
                    accentColor: "#66BB6A", 
                    width: "120px",
                    cursor: "pointer"
                  }}
                />
              </div>

              {dsaModule === "path" && (
                <div style={{ display: "flex", gap: "10px" }}>
                  <button 
                    disabled={isPathfinding}
                    onClick={() => runPathfinder("bfs")}
                    className="btn btn-primary"
                    style={{ padding: "8px 16px", fontSize: "0.8rem" }}
                  >
                    Run BFS (Shortest Path)
                  </button>
                  <button 
                    disabled={isPathfinding}
                    onClick={() => runPathfinder("dfs")}
                    className="btn btn-ghost"
                    style={{ padding: "8px 16px", fontSize: "0.8rem" }}
                  >
                    Run DFS (Depth Path)
                  </button>
                  <button 
                    onClick={initGrid}
                    style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <RefreshCw size={14} /> Reset
                  </button>
                </div>
              )}

              {dsaModule === "sort" && (
                <div style={{ display: "flex", gap: "10px" }}>
                  <button 
                    disabled={isSorting}
                    onClick={runBubbleSort}
                    className="btn btn-primary"
                    style={{ padding: "8px 16px", fontSize: "0.8rem" }}
                  >
                    Run Bubble Sort
                  </button>
                  <button 
                    onClick={initSortArray}
                    style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <RefreshCw size={14} /> Reset
                  </button>
                </div>
              )}

              {dsaModule === "bst" && (
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input 
                    type="number"
                    value={bstInput}
                    onChange={e => setBstInput(e.target.value)}
                    style={{ width: "60px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(102,187,106,0.3)", borderRadius: "4px", padding: "6px", color: "#fff", outline: "none", fontSize: "0.8rem" }}
                  />
                  <button 
                    onClick={insertBSTNode}
                    className="btn btn-primary"
                    style={{ padding: "8px 16px", fontSize: "0.8rem" }}
                  >
                    Insert Key
                  </button>
                  <button 
                    onClick={() => { setBstRoot(null); setBstMsg("BST cleared."); }}
                    style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <RefreshCw size={14} /> Clear Tree
                  </button>
                </div>
              )}
            </div>

            {/* Visualizer Canvas Area */}
            <div 
              className="glass-dark" 
              style={{ 
                borderRadius: "16px", 
                padding: "24px",
                minHeight: "450px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                position: "relative"
              }}
            >
              
              {/* Pathfinder Grid */}
              {dsaModule === "path" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${gridCols}, 40px)`, gap: "4px" }}>
                    {grid.map((row, rIdx) => 
                      row.map((cell, cIdx) => {
                        let bg = "rgba(255,255,255,0.03)";
                        let border = "1px solid rgba(255,255,255,0.08)";
                        let label = "";

                        if (cell === "start") {
                          bg = "#2E7D32";
                          border = "2px solid #66BB6A";
                          label = "🚑";
                        } else if (cell === "target") {
                          bg = "#B71C1C";
                          border = "2px solid #EF5350";
                          label = "🐶";
                        } else if (cell === "wall") {
                          bg = "#203424";
                          border = "1px solid rgba(102,187,106,0.2)";
                          label = "🌊";
                        } else if (cell === "visited") {
                          bg = "rgba(0,188,212,0.15)";
                          border = "1px solid rgba(0,188,212,0.4)";
                        } else if (cell === "path") {
                          bg = "rgba(76,175,80,0.3)";
                          border = "2px solid #66BB6A";
                          label = "🟢";
                        }

                        return (
                          <div 
                            key={`${rIdx}-${cIdx}`}
                            style={{
                              width: "40px",
                              height: "40px",
                              background: bg,
                              border: border,
                              borderRadius: "4px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.2rem",
                              transition: "all 0.15s ease"
                            }}
                          >
                            {label}
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "16px", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", flexWrap: "wrap", justifyContent: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "12px", height: "12px", background: "#2E7D32", display: "inline-block", borderRadius: "2px" }} />
                      <span>Start (Ambulance)</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "12px", height: "12px", background: "#B71C1C", display: "inline-block", borderRadius: "2px" }} />
                      <span>Target (Puppy)</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "12px", height: "12px", background: "#203424", display: "inline-block", borderRadius: "2px" }} />
                      <span>Flooded Blocks</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "12px", height: "12px", background: "rgba(0,188,212,0.3)", display: "inline-block", borderRadius: "2px" }} />
                      <span>Visited nodes</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sorting Columns */}
              {dsaModule === "sort" && (
                <div style={{ width: "100%", maxWidth: "500px", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "240px", width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", borderRadius: "8px", border: "1px solid rgba(102,187,106,0.1)" }}>
                    {sortingArray.map((item, idx) => {
                      let color = "linear-gradient(180deg, #1B5E20 0%, #2E7D32 100%)";
                      let border = "1px solid rgba(102, 187, 106, 0.3)";

                      if (item.state === "compare") {
                        color = "linear-gradient(180deg, #E65100 0%, #EF6C00 100%)";
                        border = "2px solid #FF9800";
                      } else if (item.state === "swap") {
                        color = "linear-gradient(180deg, #B71C1C 0%, #C62828 100%)";
                        border = "2px solid #F44336";
                      } else if (item.state === "sorted") {
                        color = "linear-gradient(180deg, #2E7D32 0%, #66BB6A 100%)";
                        border = "2px solid #A5D6A7";
                      }

                      return (
                        <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>{item.val}</span>
                          <div 
                            style={{
                              width: "100%",
                              height: `${item.val * 2}px`,
                              background: color,
                              border: border,
                              borderRadius: "4px 4px 0 0",
                              transition: "all 0.15s ease"
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: "24px", fontSize: "0.85rem" }}>
                    <span>Comparisons: <strong style={{color:"#A5D6A7"}}>{sortMetrics.compares}</strong></span>
                    <span>Swaps: <strong style={{color:"#A5D6A7"}}>{sortMetrics.swaps}</strong></span>
                  </div>
                </div>
              )}

              {/* BST Graph Insert Canvas */}
              {dsaModule === "bst" && (
                <div style={{ width: "100%", maxWidth: "500px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ height: "300px", width: "100%", position: "relative", background: "rgba(0,0,0,0.3)", borderRadius: "8px", border: "1px solid rgba(102,187,106,0.1)", overflow: "hidden" }}>
                    {/* SVG Connector Lines */}
                    <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
                      {(() => {
                        const links: React.ReactNode[] = [];
                        const traverse = (node: BSTNode | null) => {
                          if (!node) return;
                          if (node.left) {
                            links.push(
                              <line 
                                key={`l-${node.val}-${node.left.val}`}
                                x1={node.x} y1={node.y} x2={node.left.x} y2={node.left.y}
                                stroke="rgba(102,187,106,0.3)" strokeWidth="2"
                              />
                            );
                            traverse(node.left);
                          }
                          if (node.right) {
                            links.push(
                              <line 
                                key={`l-${node.val}-${node.right.val}`}
                                x1={node.x} y1={node.y} x2={node.right.x} y2={node.right.y}
                                stroke="rgba(102,187,106,0.3)" strokeWidth="2"
                              />
                            );
                            traverse(node.right);
                          }
                        };
                        traverse(bstRoot);
                        return links;
                      })()}
                    </svg>

                    {/* Tree Nodes rendering */}
                    {(() => {
                      const nodes: React.ReactNode[] = [];
                      const traverse = (node: BSTNode | null) => {
                        if (!node) return;
                        const isActive = bstActiveNodeVal === node.val;
                        nodes.push(
                          <div 
                            key={`node-${node.val}`}
                            style={{
                              position: "absolute",
                              left: `${node.x - 20}px`,
                              top: `${node.y - 20}px`,
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              background: isActive ? "#EF5350" : "#2E7D32",
                              border: `2px solid ${isActive ? "#F44336" : "#66BB6A"}`,
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.8rem",
                              fontWeight: "bold",
                              boxShadow: isActive ? "0 0 15px #F44336" : "0 4px 10px rgba(0,0,0,0.3)",
                              transition: "all 0.15s ease",
                              zIndex: 2
                            }}
                          >
                            {node.val}
                          </div>
                        );
                        traverse(node.left);
                        traverse(node.right);
                      };
                      traverse(bstRoot);
                      return nodes;
                    })()}

                    {!bstRoot && (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>
                        BST Empty. Insert root node.
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: "16px", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", minHeight: "20px" }}>
                    {bstMsg}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
