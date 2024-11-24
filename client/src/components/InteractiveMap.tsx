"use client";

import React, { useState, useRef, useEffect } from "react";
import CanadaMap, { Provinces } from "react-canada-map";
import { Sidebar } from "@/components/Sidebar";
import { Timeline } from "@/components/Timeline";
import { Person, Message } from "@/types";
import Image from "next/image";
import logo from "../assets/polisims.png";

interface PeoplePerProvince {
	[province: string]: Person[];
}

const generatePeoplePerProvince = (): PeoplePerProvince => {
	// Use fixed indices for consistent rendering between server and client
	const indices = [1, 2, 3, 4, 5, 6, 7, 8];
	return {
		ON: indices.map((index) => ({
			name: `Person ${index}`,
			age: 25 + index,
			gender: index % 2 === 0 ? "male" : "female",
			address: `${index * 100} Main St`,
			pfpUrl: `https://xsgames.co/randomusers/assets/avatars/pixel/${index}.jpg`,
		})),
	};
};

const peoplePerProvince = generatePeoplePerProvince();

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

	useEffect(() => {
		const pollMessages = async () => {
			try {
				// const response = await fetch('http://localhost:3001/api/messages');
				// const responseMessages = await response.json();
        const responseMessages = [
          [{'speaker': 'Banking', 'status': 'decision_maker', 'message': "As a decision maker in the banking industry, I've noticed a significant decrease in consumer spending, particularly in debt repayment and savings accounts, which is a major concern for our business model. I'd like to hear your perspective on how Universal Basic Income has affected the insurance industry, specifically in terms of shifting risk assessment, changing demographics, and the potential for increased reinsurance demand."}, {'speaker': 'Insurance', 'status': 'decision_maker', 'message': "I can relate to your concerns about decreased consumer spending, as we're seeing similar trends in the insurance industry, where people might be less inclined to prioritize savings and debt repayment, potentially leading to reduced premiums and policy sales. However, our experience suggests that Universal Basic Income will also lead to an increase in insurance claims as people take on more risks and a shift in demographics, requiring us to adapt our offerings and actuarial models."}, {'speaker': 'Banking', 'status': 'decision_maker', 'message': "I appreciate your candid input on how Universal Basic Income is affecting the insurance industry. Similar to your experience with shifting demographics and increased insurance claims, we're seeing a rise in account closures and loan defaults in our banking portfolio, which is prompting us to re-evaluate our underwriting strategies and customer engagement initiatives to better manage risk and adapt to changing consumer behavior."}, {'speaker': 'Insurance', 'status': 'decision_maker', 'message': "As we discussed how Universal Basic Income will reshape our industries, I plan to explore opportunities for innovative policy developments, such as accident-only policies, to meet the evolving needs of our customers and potentially mitigate the effects of increased claims. I also believe it's essential to collaborate with regulatory bodies to ensure that the new regulations address the changing risk landscape, guaranteeing a stable environment for both our industries to navigate these unprecedented times."}]
        ];
        const newMessages = responseMessages.map((conversation) => ({
          sender: {
            industry: conversation[0]['speaker'].toLowerCase(),
            role: conversation[0]['status'].toLowerCase(),
          },
          receiver: {
            industry: conversation[1]['speaker'].toLowerCase(),
            role: conversation[1]['status'].toLowerCase(),
          },
          conversation_history: conversation.map((message) => message['message']),
        })) as Message[];
				setMessages(newMessages);
			} catch (error) {
				console.error("Error fetching messages:", error);
			}
		};

		const intervalId = setInterval(pollMessages, 5000);

		return () => clearInterval(intervalId);
	}, []);

	const handlePlay = () => {
		// Reset animation state if already animating
		if (isAnimating) {
			setIsAnimating(false);
			setShowMail(false);
			setCurrentMessageIndex(0);
			return;
		}

		setIsAnimating(true);
		setCurrentMessageIndex(0); // Reset to start
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
						const mailElement = document.querySelector(
							".mail-icon"
						) as HTMLElement;
						if (mailElement) {
							mailElement.style.transition =
								"left 1s ease-in-out, top 1s ease-in-out";
							mailElement.style.left = receiverPosition.left;
							mailElement.style.top = receiverPosition.top;

							// Wait longer at receiver's position (3 seconds total)
							setTimeout(() => {
								setShowMail(false);
								resolve();
							}, 2000); // Increased from 1000 to 3000
						} else {
							resolve();
						}
					});
				}

				// Increased delay before next message to account for longer display time
				setTimeout(() => animateMessages(index + 1), 1000); // Increased from 1000 to 4000
			} else {
				setIsAnimating(false);
				setShowMail(false);
			}
		};
		animateMessages(0); // Start from index 0
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
					<input
						type="text"
						placeholder="Enter a policy to analyze (e.g., 'Universal Basic Income policy')"
						value={policy}
						onChange={(e) => setPolicy(e.target.value)}
						className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
					/>
				</div>
				<button
					onClick={() => {
						// TODO: Send policy to backend
						console.log("Analyzing policy:", policy);
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
									transform: "translate(-50%, -50%)",
									zIndex: 1000,
									transition:
										"left 1s ease-in-out, top 1s ease-in-out",
									cursor: "pointer",
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
				people={peoplePerProvince[provinceSelected as Provinces] || []}
				currentMessage={messages[currentMessageIndex]}
			/>
			<Timeline
				currentIndex={currentMessageIndex}
				totalMessages={messages.length}
				onIndexChange={setCurrentMessageIndex}
				onPlay={handlePlay}
			/>
		</div>
	);
};

export default App;
