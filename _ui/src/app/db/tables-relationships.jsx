"use client";

import React, { useCallback } from "react";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { WorkflowIcon } from "lucide-react";

import ReactFlow, {
	Controls,
	Background,
	useNodesState,
	useEdgesState,
	addEdge,
} from "reactflow";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import "reactflow/dist/style.css";

import * as d3 from "d3-force";

export default function TableRelationships({ dbInfo }) {
	const [open, setOpen] = React.useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen} className="">
			<DialogTrigger>
				<TooltipProvider delayDuration={300}>
					<Tooltip>
						<TooltipTrigger asChild>
							<span role="button">
								<WorkflowIcon width={18} height={18} className="w-6 h-6" />
							</span>
						</TooltipTrigger>
						<TooltipContent>Relationships</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</DialogTrigger>
			<DialogContent className="max-w-[95%] lg:max-w-5xl">
				<RelationshipsComponent dbInfo={dbInfo} />
			</DialogContent>
		</Dialog>
	);
}

function RelationshipsComponent({ dbInfo }) {
	const initialNodes = dbInfo?.tables?.map((table) => {
		return {
			id: table,
			position: { x: 0, y: 0 },
			data: { label: table },
			style: { width: "auto" },
			connectable: true,
		};
	});

	// console.log(initialNodes)

	const foreignKeyEdges = Object.entries(dbInfo.foreign_keys).flatMap(
		([tableName, foreignKeys]) => {
			return foreignKeys.map((fk) => ({
				id: `${tableName}.${fk.from}>${fk.table}.${fk.to}`,
				target: tableName,
				source: fk.table,
				animated: true,

				// type: 's',
				// label: `${tableName} to ${fk.table}`
			}));
		},
	);

	console.log({ foreignKeyEdges });

	const positionedNodes = positionOnlyRelatedNodesConsideringRelations(
		initialNodes,
		foreignKeyEdges,
	);
	// const positionedNodes = positionNodesConsideringRelations(initialNodes, foreignKeyEdges);
	// const positionedNodes = positionNodesFibonacci(initialNodes);

	console.log({ positionedNodes });

	const [nodes, setNodes, onNodesChange] = useNodesState(positionedNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(foreignKeyEdges);

	const onConnect = useCallback(
		(params) => setEdges((eds) => addEdge(params, eds)),
		[setEdges],
	);

	console.log({ dbInfo });

	return (
		<div className="w-full h-[500px]">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				// onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				fitView
				proOptions={{
					hideAttribution: true,
				}}
				attributionPosition="top-left"
			>
				{/* <MiniMap /> */}
				<Controls showZoom={false} showInteractive={false} />
				<Background />
			</ReactFlow>
		</div>
	);

	function positionNodesFibonacci(nodes) {
		const calculateFibonacciLayout = (count) => {
			const goldenRatio = (1 + Math.sqrt(5)) / 2;
			const angleIncrement = Math.PI * (3 - Math.sqrt(5)); // 137.5 degrees

			const nodes = [];
			for (let i = 0; i < count; i++) {
				const radius = Math.sqrt(i + 0.5) * goldenRatio;
				const angle = i * angleIncrement;
				const x = radius * Math.cos(angle);
				const y = radius * Math.sin(angle);
				nodes.push({ x, y });
			}
			return nodes;
		};

		const layout = calculateFibonacciLayout(nodes.length);
		return nodes.map((node, index) => ({
			...node,
			position: {
				x: layout[index].x * 100 + window.innerWidth / 2 - 100, // Adjusting for node width and centering
				y: layout[index].y * 100 + window.innerHeight / 2 - 25, // Adjusting for node height and centering
			},
		}));
	}

	function positionOnlyRelatedNodesConsideringRelations(
		nodes,
		foreignKeyEdges,
	) {
		const links = foreignKeyEdges.map((edge) => ({
			source: nodes.find((node) => node.id === edge.source),
			target: nodes.find((node) => node.id === edge.target),
		}));

		// Create a set of all node IDs that are involved in relationships
		const relatedNodeIds = new Set(
			foreignKeyEdges.flatMap((edge) => [edge.source, edge.target]),
		);

		// Filter nodes to include only those that are involved in relationships
		const relatedNodes = nodes.filter((node) => relatedNodeIds.has(node.id));

		const simulation = d3
			.forceSimulation(relatedNodes)
			.force(
				"link",
				d3
					.forceLink(links)
					.id((d) => d.id)
					.distance(250),
			)
			.force("charge", d3.forceManyBody().strength(-500))
			.force(
				"center",
				d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2),
			)
			.stop();

		for (let i = 0; i < 200; ++i) simulation.tick();

		// Map over relatedNodes instead of all nodes to only position those involved in relationships
		const positionedNodes = relatedNodes.map((node) => ({
			...node,
			position: {
				x: node.x,
				y: node.y,
			},
		}));

		return positionedNodes;
	}

	function positionNodesConsideringRelations(nodes, foreignKeyEdges) {
		const links = foreignKeyEdges.map((edge) => ({
			source: nodes.find((node) => node.id === edge.source),
			target: nodes.find((node) => node.id === edge.target),
		}));

		const simulation = d3
			.forceSimulation(nodes)
			.force(
				"link",
				d3
					.forceLink(links)
					.id((d) => d.id)
					.distance(200),
			)
			.force("charge", d3.forceManyBody().strength(-400))
			.force(
				"center",
				d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2),
			)
			.stop();

		for (let i = 0; i < 300; ++i) simulation.tick();

		const positionedNodes = nodes.map((node) => ({
			...node,
			position: {
				x: node.x,
				y: node.y,
			},
		}));

		return positionedNodes;
	}
}
