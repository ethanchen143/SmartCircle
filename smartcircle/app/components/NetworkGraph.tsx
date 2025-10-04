'use client';

import { useEffect, useState, useRef } from 'react';
import { Connection } from '../page';

interface NetworkGraphProps {
  connections: Connection[];
  onConnectionClick: (connection: Connection) => void;
  focusedNodeId?: string | null;
}

interface Node {
  id: string;
  x: number;
  y: number;
  connection?: Connection;
  isUser?: boolean;
}

interface NoteNode {
  text: string;
  x: number;
  y: number;
}

export default function NetworkGraph({ connections, onConnectionClick, focusedNodeId }: NetworkGraphProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [noteNodes, setNoteNodes] = useState<NoteNode[]>([]);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse notes into individual note nodes
  const parseNotes = (notes: string): string[] => {
    if (!notes || notes.trim() === '') return [];

    // Split by periods, newlines, or semicolons
    const sentences = notes
      .split(/[.;\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 100); // Filter out empty and very long notes

    return sentences;
  };

  // Generate note nodes around a connection
  const generateNoteNodes = (node: Node): NoteNode[] => {
    if (!node.connection) return [];

    const noteSentences = parseNotes(node.connection.notes);
    if (noteSentences.length === 0) return [];

    const noteNodeList: NoteNode[] = [];
    const baseRadius = 120; // Distance from parent node

    noteSentences.forEach((sentence, i) => {
      // Evenly distribute notes in a circle
      const angle = (i / noteSentences.length) * Math.PI * 2 - Math.PI / 2; // Start from top
      const distance = baseRadius;

      noteNodeList.push({
        text: sentence,
        x: node.x + Math.cos(angle) * distance,
        y: node.y + Math.sin(angle) * distance
      });
    });

    return noteNodeList;
  };

  // Get color based on closeness: red (hot/close) -> gray (neutral) -> blue (cold/distant)
  const getClosenessColor = (closeness: number) => {
    // closeness is 1-10
    // 10-9: Hot red
    // 8-6: Light red/pink
    // 5: Gray (neutral)
    // 4-2: Light blue
    // 1: Cold blue

    if (closeness >= 9) {
      // Very close: Hot red
      return `hsl(0, ${60 + (closeness - 9) * 20}%, ${50 + (closeness - 9) * 5}%)`;
    } else if (closeness >= 6) {
      // Close: Red to light red/pink
      const t = (closeness - 6) / 3; // 0 to 1
      const saturation = 40 + t * 20;
      const lightness = 55 + t * 5;
      return `hsl(0, ${saturation}%, ${lightness}%)`;
    } else if (closeness === 5) {
      // Neutral: Gray
      return `hsl(0, 5%, 60%)`;
    } else if (closeness >= 2) {
      // Distant: Light blue to blue
      const t = (closeness - 2) / 3; // 0 to 1
      const saturation = 40 + t * 20;
      const lightness = 55 + t * 5;
      return `hsl(220, ${saturation}%, ${lightness}%)`;
    } else {
      // Very distant: Cold blue
      return `hsl(220, ${60 + (2 - closeness) * 20}%, ${50 + (2 - closeness) * 5}%)`;
    }
  };

  // Calculate dynamic viewBox based on nodes
  const [viewBox, setViewBox] = useState({ minX: -1000, minY: -1000, width: 2000, height: 2000 });

  // Initialize nodes - position based on last connected time
  useEffect(() => {
    const centerX = 0;
    const centerY = 0;

    const userNode: Node = {
      id: 'user',
      x: centerX,
      y: centerY,
      isUser: true
    };

    if (connections.length === 0) {
      setNodes([userNode]);
      return;
    }

    // Store previous node positions to preserve angles
    const previousPositions = new Map<string, { angle: number; distance: number }>();
    nodes.forEach(node => {
      if (node.connection) {
        const dx = node.x - centerX;
        const dy = node.y - centerY;
        const angle = Math.atan2(dy, dx);
        const distance = Math.sqrt(dx * dx + dy * dy);
        previousPositions.set(node.id, { angle, distance });
      }
    });

    // Calculate all distances first to find max
    const connectionsWithDistance = connections.map((conn) => {
      const daysSinceAdded = Math.floor(
        (new Date().getTime() - new Date(conn.dateAdded).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Normalize distance calculation - use logarithmic scale for better distribution
      const normalizedDays = Math.log(daysSinceAdded + 1) * 100;
      const baseDistance = 200 + normalizedDays;

      return { conn, daysSinceAdded, baseDistance };
    });

    // Sort by distance ascending (closest first)
    connectionsWithDistance.sort((a, b) => a.baseDistance - b.baseDistance);

    // Normalize all distances to a 0-1 range
    const minDist = connectionsWithDistance[0].baseDistance;
    const maxDist = connectionsWithDistance[connectionsWithDistance.length - 1].baseDistance;
    const distRange = maxDist - minDist || 1;

    // Create distance buckets for better spacing
    const buckets: { conn: Connection; normalizedDist: number }[][] = Array.from({ length: 15 }, () => []);

    connectionsWithDistance.forEach(({ conn, baseDistance }) => {
      const normalizedDist = (baseDistance - minDist) / distRange;
      const bucketIndex = Math.min(14, Math.floor(normalizedDist * 15));
      buckets[bucketIndex].push({ conn, normalizedDist });
    });

    // Position nodes in concentric rings based on buckets
    const connectionNodes: Node[] = [];
    const minRadius = 200;
    const maxRadius = 800;

    buckets.forEach((bucket, bucketIndex) => {
      if (bucket.length === 0) return;

      const ringRadius = minRadius + (bucketIndex / 14) * (maxRadius - minRadius);
      const anglePerNode = (Math.PI * 2) / bucket.length;

      bucket.forEach(({ conn }, indexInBucket) => {
        let angle: number;

        // Check if this node existed before - preserve its angle
        const prevPos = previousPositions.get(conn.id);
        if (prevPos) {
          angle = prevPos.angle;
        } else {
          // New node - calculate angle with random noise
          const baseAngle = indexInBucket * anglePerNode - Math.PI / 2;
          const angleNoise = (Math.random() - 0.5) * (anglePerNode * 0.3);
          angle = baseAngle + angleNoise;
        }

        connectionNodes.push({
          id: conn.id,
          x: centerX + Math.cos(angle) * ringRadius,
          y: centerY + Math.sin(angle) * ringRadius,
          connection: conn
        });
      });
    });

    // Calculate bounds to set viewBox
    const allX = connectionNodes.map(n => n.x);
    const allY = connectionNodes.map(n => n.y);
    const minX = Math.min(...allX, centerX) - 300;
    const maxX = Math.max(...allX, centerX) + 300;
    const minY = Math.min(...allY, centerY) - 300;
    const maxY = Math.max(...allY, centerY) + 300;
    const width = maxX - minX;
    const height = maxY - minY;

    setViewBox({ minX, minY, width, height });
    setNodes([userNode, ...connectionNodes]);
  }, [connections]);

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.1, transform.scale + delta), 3);
    setTransform({ ...transform, scale: newScale });
  };

  // Handle pan start
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  // Handle pan move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setTransform({
        ...transform,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  // Handle pan end
  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Reset view
  const resetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  const userNode = nodes.find(n => n.isUser);

  // Focus on a specific node when focusedNodeId changes
  useEffect(() => {
    if (focusedNodeId) {
      const focusedNode = nodes.find(n => n.id === focusedNodeId);
      if (focusedNode) {
        // Calculate the transform to center this node
        const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
        const containerHeight = containerRef.current?.clientHeight || window.innerHeight;

        // We need to account for the viewBox coordinates
        // Center the focused node in the viewport
        const targetScale = 1.5; // Zoom in a bit

        setTransform({
          x: 0,
          y: 0,
          scale: targetScale
        });

        // Also set it as selected to show details persistently
        setSelectedNode(focusedNode);
      }
    }
  }, [focusedNodeId, nodes]);

  // Adaptive node sizes based on number of nodes
  const getNodeRadius = (isUser: boolean) => {
    if (isUser) {
      return 100;
    }

    // Scale connection nodes based on total count
    const connectionCount = connections.length;

    if (connectionCount <= 50) {
      return 50;
    }

    // More nodes = smaller individual nodes to prevent overlap
    return 5000 / connectionCount;
  };

  return (
    <div className="relative w-full h-full bg-gray-50 overflow-hidden">
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          className="w-full h-full"
          viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`
          }}
        >
          {/* Draw edges */}
          {nodes.map(node => {
            if (node.isUser || !userNode) return null;

            const edgeColor = node.connection ? getClosenessColor(node.connection.closeness) : '#e5e7eb';
            const edgeOpacity = hoveredNode && hoveredNode !== node ? 0.1 : 0.3;

            // Create curved path for organic feel with smart routing
            const dx = node.x - userNode.x;
            const dy = node.y - userNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Use varying curvature to create more organic paths and avoid overlaps
            const nodeAngle = Math.atan2(dy, dx);
            const curvatureDirection = Math.sin(nodeAngle * 3); // Varies curve direction based on position
            const curvature = distance * (0.1 + Math.abs(curvatureDirection) * 0.1);

            const midX = (userNode.x + node.x) / 2;
            const midY = (userNode.y + node.y) / 2;

            // Control point offset perpendicular to the line, alternating direction
            const controlX = midX - (dy / distance) * curvature * Math.sign(curvatureDirection);
            const controlY = midY + (dx / distance) * curvature * Math.sign(curvatureDirection);

            const pathD = `M ${userNode.x} ${userNode.y} Q ${controlX} ${controlY} ${node.x} ${node.y}`;

            return (
              <g key={`edge-${node.id}`}>
                <path
                  d={pathD}
                  stroke={edgeColor}
                  strokeWidth={1.5}
                  strokeOpacity={edgeOpacity}
                  fill="none"
                />
              </g>
            );
          })}


          {/* Draw nodes */}
          {nodes.map(node => {
            const nodeColor = node.isUser
              ? '#4f46e5'
              : node.connection
                ? getClosenessColor(node.connection.closeness)
                : '#ffffff';
            const radius = getNodeRadius(node.isUser || false);
            const isHovered = hoveredNode === node;
            const isFocused = focusedNodeId === node.id;
            const isDimmed = (hoveredNode && hoveredNode !== node && !node.isUser) || (focusedNodeId && focusedNodeId !== node.id && !node.isUser);

            return (
              <g
                key={node.id}
                onMouseEnter={() => {
                  if (!node.isUser && !selectedNode) {
                    setHoveredNode(node);
                  }
                }}
                onMouseLeave={() => {
                  if (!selectedNode) {
                    setHoveredNode(null);
                  }
                }}
                onClick={() => {
                  if (node.connection) {
                    // Toggle selection: if already selected, unselect and clear hover
                    if (selectedNode?.id === node.id) {
                      setSelectedNode(null);
                      setHoveredNode(null);
                    } else {
                      setSelectedNode(node);
                      setHoveredNode(null);
                    }
                  }
                }}
                className="cursor-pointer"
                opacity={isDimmed ? 0.3 : 1}
              >
                {/* Background circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius}
                  fill={nodeColor}
                  stroke={(isHovered || isFocused) ? '#1f2937' : 'none'}
                  strokeWidth={(isHovered || isFocused) ? 3 : 0}
                />

                {/* Profile Image */}
                {!node.isUser && node.connection?.profileImage && (
                  <clipPath id={`clip-${node.id}`}>
                    <circle cx={node.x} cy={node.y} r={radius * 0.85} />
                  </clipPath>
                )}
                {!node.isUser && node.connection?.profileImage && (
                  <image
                    href={node.connection.profileImage}
                    x={node.x - radius * 0.85}
                    y={node.y - radius * 0.85}
                    width={radius * 1.7}
                    height={radius * 1.7}
                    clipPath={`url(#clip-${node.id})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                )}

                {/* Text label */}
                {node.isUser && (
                  <text
                    x={node.x}
                    y={node.y}
                    fill="white"
                    fontSize={15 * (radius / 50)}
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    pointerEvents="none"
                  >
                    You
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Status box for hovered or selected connection */}
      {(hoveredNode?.connection || selectedNode?.connection) && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-200 px-8 py-5 max-w-5xl">
          {(() => {
            const displayNode = selectedNode || hoveredNode;
            if (!displayNode?.connection) return null;

            return (
              <>
                {/* First line: Profile Image | Email, Phone | Name | Age, Location, Socials, Edit */}
                <div className="flex items-center gap-8">
                  {/* Profile Image */}
                  {displayNode.connection.profileImage && (
                    <img
                      src={displayNode.connection.profileImage}
                      alt={displayNode.connection.name}
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    />
                  )}

                  {/* Left side: Email & Phone */}
                  <div className="flex flex-col gap-1">
                    {displayNode.connection.email && (
                      <a
                        href={`mailto:${displayNode.connection.email}`}
                        className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
                      >
                        {displayNode.connection.email}
                      </a>
                    )}
                    {displayNode.connection.phoneNumber && (
                      <div className="text-sm font-medium text-gray-700">
                        {displayNode.connection.phoneNumber}
                      </div>
                    )}
                  </div>

                  {/* Center: Name, Profession, Last Connected & Closeness */}
                  <div className="flex-grow text-center">
                    <h2 className="text-3xl font-bold text-gray-900">{displayNode.connection.name}</h2>
                    <p className="text-sm text-gray-600 mt-1">{displayNode.connection.profession}</p>
                    <div className="flex items-center justify-center gap-3 mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        <span>
                          {(() => {
                            const daysSince = Math.floor(
                              (new Date().getTime() - new Date(displayNode.connection.dateAdded).getTime()) / (1000 * 60 * 60 * 24)
                            );
                            if (daysSince === 0) return 'Connected today';
                            if (daysSince === 1) return 'Connected yesterday';
                            if (daysSince < 7) return `Connected ${daysSince} days ago`;
                            if (daysSince < 30) return `Connected ${Math.floor(daysSince / 7)} weeks ago`;
                            if (daysSince < 365) return `Connected ${Math.floor(daysSince / 30)} months ago`;
                            return `Connected ${Math.floor(daysSince / 365)} years ago`;
                          })()}
                        </span>
                      </div>
                      <div className="text-gray-400">•</div>
                      <div className="flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <span className="font-medium">Closeness: {displayNode.connection.closeness}/10</span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Age, Location, Socials, Edit button */}
                  <div className="flex items-center gap-4 text-sm font-medium text-gray-700">
                    <div>{displayNode.connection.age}</div>
                    <div className="text-gray-400">•</div>
                    <div>{displayNode.connection.location}</div>

                    {displayNode.connection.socials && (
                      <>
                        <div className="text-gray-400">•</div>
                        <div className="flex gap-2">
                          {displayNode.connection.socials.instagram && (
                            <a
                              href={`https://instagram.com/${displayNode.connection.socials.instagram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                              title="Instagram"
                            >
                              <span className="text-xs font-bold">IG</span>
                            </a>
                          )}
                          {displayNode.connection.socials.linkedin && (
                            <a
                              href={`https://${displayNode.connection.socials.linkedin}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                              title="LinkedIn"
                            >
                              <span className="text-xs font-bold">in</span>
                            </a>
                          )}
                          {displayNode.connection.socials.twitter && (
                            <a
                              href={`https://twitter.com/${displayNode.connection.socials.twitter.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                              title="Twitter"
                            >
                              <span className="text-xs font-bold">𝕏</span>
                            </a>
                          )}
                        </div>
                      </>
                    )}

                    {selectedNode && (
                      <>
                        <div className="text-gray-400">•</div>
                        <button
                          onClick={() => {
                            if (selectedNode.connection) {
                              onConnectionClick(selectedNode.connection);
                            }
                          }}
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 transition"
                          title="Edit connection"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          <span className="text-xs">Edit</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Second line: Sticky note with notes */}
                {displayNode.connection.notes && (
                  <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm">
                    <div className="text-gray-800 text-sm leading-relaxed italic">
                      "{displayNode.connection.notes}"
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-2">
        <button
          onClick={() => setTransform({ ...transform, scale: Math.min(3, transform.scale + 0.2) })}
          className="bg-white px-3 py-2 rounded-lg shadow border border-gray-200 hover:bg-gray-50 font-semibold text-gray-700 w-10 h-10 flex items-center justify-center"
        >
          +
        </button>
        <button
          onClick={() => setTransform({ ...transform, scale: Math.max(0.1, transform.scale - 0.2) })}
          className="bg-white px-3 py-2 rounded-lg shadow border border-gray-200 hover:bg-gray-50 font-semibold text-gray-700 w-10 h-10 flex items-center justify-center"
        >
          −
        </button>
        <button
          onClick={resetView}
          className="bg-white px-3 py-2 rounded-lg shadow border border-gray-200 hover:bg-gray-50 text-xs text-gray-700 font-medium"
        >
          Reset
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute top-6 left-6 bg-white px-4 py-2 rounded-lg shadow border border-gray-200 text-sm text-gray-600">
        Scroll to zoom • Drag to pan
      </div>
    </div>
  );
}
