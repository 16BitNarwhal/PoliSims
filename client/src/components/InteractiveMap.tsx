"use client";

import React, { useState, useRef, useEffect } from "react";
import CanadaMap, { Provinces } from "react-canada-map";
import { Sidebar } from "@/components/Sidebar";
import { Timeline } from "@/components/Timeline";
import { Person, Message } from "@/types";
import Image from "next/image";
import logo from "../assets/polisims.png";
import { policyDescriptions } from "@/data/policyDescriptions";

const industries = {
	Lumber: { position: { left: "8%", top: "40%" } }, // BC
	Banking: { position: { left: "49%", top: "61%" } }, // ON
	Fishing: { position: { left: "35%", top: "53%" } }, // MB
	Gasoline: { position: { left: "19%", top: "65%" } }, // AB
	Tech: { position: { left: "59%", top: "80%" } }, // ON
	Insurance: { position: { left: "56%", top: "45%" } }, // QC
	Grocery: { position: { left: "64%", top: "68%" } }, // QC
	Transportation: { position: { left: "41%", top: "70%" } }, // ON
};

const getIndustryPosition = (industryName: string) => {
	const key = Object.keys(industries).find(
		(k) => k.toLowerCase() === industryName.toLowerCase()
	);
	return (
		(key && industries[key as keyof typeof industries]?.position) || null
	);
};

const policyOptions = [
	"Bill 226, Fixing Tribunals Backlogs Act, 2024",
	"Bill 225, Resource Recovery and Circular Economy Amendment Act (Beverage Container Deposit Program), 2024",
	"Bill 224, Safer Driving Tests Act (Ending the Privatization Failure), 2024",
	"Bill 223, Safer Streets, Stronger Communities Act, 2024",
	"Bill 222, Heat Stress Act, 2024",
	"Bill 221, Day of Reflection for Indian Residential Schools Act, 2024",
];

const App = () => {
	const [provinceSelected, setProvinceSelected] = useState("");
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [transform, setTransform] = useState({
		scale: 1,
		translateX: 200,
		translateY: -200,
	});
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const mapContainerRef = useRef<HTMLDivElement>(null);

	const [messages, setMessages] = useState<Message[]>([]);
	const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const [mailPosition, setMailPosition] = useState({ left: "0%", top: "0%" });
	const [showMail, setShowMail] = useState(false);
	const [policy, setPolicy] = useState("");
	const [showPolicyOptions, setShowPolicyOptions] = useState(false);

	useEffect(() => {
		const pollMessages = async () => {
			try {
				const response = await fetch(
					"http://localhost:3001/api/messages"
				);
				const responseMessages = (await response.json()).data;
				console.log(responseMessages);
				const newMessages = responseMessages.map(
					(conversation: any) => ({
						sender: {
							industry: conversation[0]["speaker"].toLowerCase(),
							role: conversation[0]["status"].toLowerCase(),
						},
						receiver: {
							industry: conversation[1]["speaker"].toLowerCase(),
							role: conversation[1]["status"].toLowerCase(),
						},
						conversation_history: conversation.map(
							(message: any) => message["message"]
						),
					})
				) as Message[];
				setMessages(newMessages);
			} catch (error) {
				console.error("Error fetching messages:", error);
			}
		};

		const intervalId = setInterval(pollMessages, 5000);

		return () => clearInterval(intervalId);
	}, []);

	const handlePlay = (currentMessageIndex: number) => {
		// Reset animation state if already animating
		if (isAnimating) {
			setIsAnimating(false);
			setShowMail(false);
			// setCurrentMessageIndex(0);
			return;
		}

		setIsAnimating(true);
		// setCurrentMessageIndex(0); // Reset to start
		const animateMessages = async (index: number) => {
			if (index < messages.length) {
				const message = messages[index];
				setCurrentMessageIndex(index);

				// Get positions for sender and receiver
				const senderPosition = getIndustryPosition(
					message.sender.industry
				);
				const receiverPosition = getIndustryPosition(
					message.receiver.industry
				);

				if (senderPosition && receiverPosition) {
					// Start mail at sender position
					setMailPosition({
						left: senderPosition.left,
						top: senderPosition.top,
					});
					setShowMail(true);

					// Animate to receiver position
					await new Promise<void>((resolve) => {
						setTimeout(() => {
							setMailPosition({
								left: receiverPosition.left,
								top: receiverPosition.top,
							});

							// Wait for animation to complete
							setTimeout(() => {
								setShowMail(false);
								resolve();
							}, 2000);
						}, 1000);
					});

					// Wait before next message
					await new Promise<void>((resolve) =>
						setTimeout(resolve, 500)
					);
					animateMessages(index + 1);
				}
			} else {
				setIsAnimating(false);
				setShowMail(false);
			}
		};
		animateMessages(currentMessageIndex); // Start from index 0
	};

	const mapClickHandler = (province: string, event: React.MouseEvent) => {
		if (!isDragging) {
			setProvinceSelected(province);
			setIsSidebarOpen(true);
		}
	};

	const handleMouseDown = (e: React.MouseEvent) => {
		setIsDragging(true);
		setDragStart({
			x: e.clientX - transform.translateX,
			y: e.clientY - transform.translateY,
		});
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (isDragging) {
			const newX = e.clientX - dragStart.x;
			const newY = e.clientY - dragStart.y;
			setTransform((prev) => ({
				...prev,
				translateX: newX,
				translateY: newY,
			}));
		}
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	const handleWheel = (e: WheelEvent) => {
		e.preventDefault();
		const scaleFactor = 0.1;
		const delta = e.deltaY > 0 ? -scaleFactor : scaleFactor;

		if (mapContainerRef.current) {
			const rect = mapContainerRef.current.getBoundingClientRect();
			const cursorX = e.clientX - rect.left;
			const cursorY = e.clientY - rect.top;

			const newScale = Math.max(
				0.5,
				Math.min(4, transform.scale + delta)
			);

			const scaleChange = newScale - transform.scale;
			const newTranslateX =
				transform.translateX -
				((cursorX - transform.translateX) * scaleChange) /
					transform.scale;
			const newTranslateY =
				transform.translateY -
				((cursorY - transform.translateY) * scaleChange) /
					transform.scale;

			setTransform({
				scale: newScale,
				translateX: newTranslateX,
				translateY: newTranslateY,
			});
		}
	};

	useEffect(() => {
		const container = mapContainerRef.current;
		if (container) {
			container.addEventListener("wheel", handleWheel, {
				passive: false,
			});
		}
		return () => {
			if (container) {
				container.removeEventListener("wheel", handleWheel);
			}
		};
	}, [transform]);

	const submitPolicy = async (policy: string) => {
		try {
			const response = await fetch(
				"http://localhost:3001/api/set-policy",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ policy }),
				}
			);

			if (!response.ok) {
				throw new Error(`Error: ${response.statusText}`);
			}
		} catch (error) {
			console.error("Failed to analyze policy:", error);
		}
	};

	return (
		<div>
			<div className="fixed top-0 left-0 right-0 bg-white shadow-md p-4 z-50 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<h1 className="text-3xl font-bold text-green-700">
						PoliSims
					</h1>
					<Image
						src={logo}
						alt="PoliSims Logo"
						width={40}
						height={40}
						className="h-10 w-auto"
					/>
				</div>
				<div className="flex-grow mx-8 max-w-2xl">
					<div className="relative">
						<input
							type="text"
							placeholder="Enter or select a policy to analyze"
							value={policy}
							onChange={(e) => setPolicy(e.target.value)}
							onFocus={() => setShowPolicyOptions(true)}
							className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
						/>
						{showPolicyOptions && (
							<>
								<div className="absolute w-full mt-1 max-h-60 overflow-y-auto bg-white border rounded-lg shadow-lg z-50">
									{policyOptions.map((option) => (
										<div
											key={option}
											className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
											onClick={() => {
												setPolicy(option);
												setShowPolicyOptions(false);
											}}
										>
											{option}
										</div>
									))}
								</div>
								<div
									className="fixed inset-0 z-40"
									onClick={() => setShowPolicyOptions(false)}
								/>
							</>
						)}
					</div>
				</div>
				<button
					onClick={() => {
						if (policyOptions.includes(policy)) {
              console.log(policy + " - " + policyDescriptions[policy])
							submitPolicy(
								policy + " - " + policyDescriptions[policy]
							);
						} else {
              console.log(policy)
							submitPolicy(policy);
						}

						submitPolicy(policy + policyDescriptions[policy]);
					}}
					className="bg-green-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-green-700 transition-colors hover:cursor-pointer"
				>
					Analyze
				</button>
			</div>

			<div className="relative w-full h-screen overflow-hidden pt-16">
				<div
					ref={mapContainerRef}
					className="absolute left-0 top-0 bottom-0 right-0 cursor-grab active:cursor-grabbing"
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					onMouseLeave={handleMouseUp}
				>
					<div
						style={{
							transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
							transformOrigin: "0 0",
							transition: isDragging ? "none" : "transform 0.1s",
						}}
					>
						<CanadaMap
							fillColor="ForestGreen"
							onHoverColor="ForestGreen"
							onClick={mapClickHandler}
						/>
						{isAnimating &&
							currentMessageIndex < messages.length && (
								<>
									<div
										className="absolute w-4 h-4 bg-blue-500 rounded-full"
										style={{
											left: getIndustryPosition(
												messages[currentMessageIndex]
													.sender.industry
											)?.left,
											top: getIndustryPosition(
												messages[currentMessageIndex]
													.sender.industry
											)?.top,
											transform: "translate(-50%, -50%)",
											animation: "pulse 1s infinite",
										}}
									/>
									<div
										className="absolute w-3 h-3 bg-green-500 rounded-full"
										style={
											{
												"--start-x":
													getIndustryPosition(
														messages[
															currentMessageIndex
														].sender.industry
													)?.left,
												"--start-y":
													getIndustryPosition(
														messages[
															currentMessageIndex
														].sender.industry
													)?.top,
												"--end-x": getIndustryPosition(
													messages[
														currentMessageIndex
													].receiver.industry
												)?.left,
												"--end-y": getIndustryPosition(
													messages[
														currentMessageIndex
													].receiver.industry
												)?.top,
												left: getIndustryPosition(
													messages[
														currentMessageIndex
													].sender.industry
												)?.left,
												top: getIndustryPosition(
													messages[
														currentMessageIndex
													].sender.industry
												)?.top,
												animation:
													"travel 2s ease-in-out forwards",
											} as React.CSSProperties
										}
										onAnimationEnd={() => {
											if (
												currentMessageIndex <
												messages.length - 1
											) {
												setCurrentMessageIndex(
													(prev) => prev + 1
												);
											} else {
												setIsAnimating(false);
											}
										}}
									/>
								</>
							)}
						{showMail && (
							<div
								className="mail-icon"
								style={{
									position: "absolute",
									left: mailPosition.left,
									top: mailPosition.top,
									zIndex: 1000,
									transition:
										"left 1s ease-in-out, top 1s ease-in-out",
									cursor: "pointer",
									transform: "translate(-50%, -50%)",
								}}
								onClick={(e) => {
									e.stopPropagation();
									setIsSidebarOpen(true);
								}}
							>
								<img
									src="/mail.png"
									alt="Mail"
									className="w-8 h-8"
								/>
							</div>
						)}
						{Object.keys(industries).map((industry, index) => (
							<div
								key={index}
								style={{
									position: "absolute",
									left: `${
										(
											industries as Record<
												string,
												{
													position: {
														left: string;
														top: string;
													};
												}
											>
										)[industry].position.left
									}`,
									top: `${
										(
											industries as Record<
												string,
												{
													position: {
														left: string;
														top: string;
													};
												}
											>
										)[industry].position.top
									}`,
									transform: `translate(-50%, -50%)`,
								}}
							>
								<img
									className="w-12 h-12"
									src={`/industry/${industry.toLowerCase()}.png`}
									alt={industry}
								/>
							</div>
						))}
					</div>
				</div>
			</div>
			<Sidebar
				province={provinceSelected}
				isOpen={isSidebarOpen}
				onClose={() => setIsSidebarOpen(false)}
				currentMessage={messages[currentMessageIndex]}
			/>
			<Timeline
				currentIndex={currentMessageIndex}
				totalMessages={messages.length}
				onIndexChange={setCurrentMessageIndex}
				onPlay={() => handlePlay(currentMessageIndex)}
			/>
		</div>
	);
};

export default App;
