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
				// const response = await fetch(
				// 	"http://localhost:3001/api/messages"
				// );
				// const responseMessages = (await response.json()).data;
				// console.log(responseMessages);
				const responseMessages = [
                    [{'speaker': 'Fishing', 'status': 'decision_maker', 'message': "As a decision-maker in the fishing industry, I've noticed a shift in consumer demand for seafood products due to increased disposable income from UBI. With some consumers opting for premium and sustainable options, it's been a challenge for us to maintain high-quality suppliers and distribution networks while absorbing the resulting increase in production costs.\n\nHow have you seen the UBI policy impact your industry's labor costs and operational efficiency, and have you noticed any changes in consumer purchasing behavior that are affecting your business?"}, {'speaker': 'Grocery', 'status': 'decision_maker', 'message': "I completely understand your perspective on shifting consumer demand for premium and sustainable seafood options, as we're seeing a similar trend in the grocery industry with increased disposable income from UBI - our customers are now opting for higher-end products and organic options, which in turn affects our operational efficiency and labor costs.\n\nI've noticed that our labor costs have indeed increased due to the UBI implementation, forcing us to reassess our pricing strategies and optimize our operational processes to minimize the impact on our bottom line, and I'm curious to know how you're managing to balance these changes and maintain a healthy supply chain for premium seafood products."}, {'speaker': 'Fishing', 'status': 'decision_maker', 'message': "I can definitely relate to the increased labor costs you're experiencing in the grocery industry, as we're also having to carefully examine our workforce and supply chain management to maintain our supply of high-quality seafood products, considering we've experienced a similar rise in demand for premium options. We're adapting our operational strategies to offset the increased labor costs, such as optimizing our distribution networks and investigating sustainable fisheries to provide a consistent supply of eco-friendly seafood products."}, {'speaker': 'Grocery', 'status': 'decision_maker', 'message': "I'd like to explore the possibility of our industries collaborating to develop more sustainable sourcing practices, which could help us both manage increased production costs and maintain a high-quality supply chain for premium products. By working together, we could also establish a more efficient distribution network and share best practices for managing the labor costs associated with UBI implementation."}], [{'speaker': 'Fishing', 'status': 'decision_maker', 'message': "Honestly, the implementation of Universal Basic Income has been a game-changer for the fishing industry - with an increase in disposable income, we're seeing a surge in demand for seafood, which is putting a strain on our labor force and supply chains. Can you tell me, since UBI seems to have a relatively limited impact on your side of things, how are you adjusting compensation packages and adapting to the potential shift in consumer behavior and leisure time in the Transportation industry?"}, {'speaker': 'Transportation', 'status': 'decision_maker', 'message': "I completely understand the challenges you're facing with increased demand and labor shortages in the fishing industry due to UBI. To be honest, our industry hasn't seen a similar surge in demand, but we are exploring ways to adjust compensation packages to account for potential increased turnover and offering more flexible, autonomous transportation services to cater to the increased leisure time potentially enabled by UBI."}, {'speaker': 'Fishing', 'status': 'decision_maker', 'message': "I can sense the complexity of managing labor shortages and supply chain strain, which echoes some of the concerns we've been facing in the fishing industry, albeit with a different set of demands on our workforce. We're actually considering similar compensation adjustments and exploring opportunities to upskill our employees to handle the demands of increased production, so I'm curious to hear more about your approach to adjusting compensation packages."}, {'speaker': 'Transportation', 'status': 'decision_maker', 'message': "Now that you're navigating the increased labor demands and supply chain strain in the fishing industry due to UBI, we in the Transportation industry are actually considering launching internal mentorship programs to upskill our employees and enhance their adaptability, especially with a potential influx of new talent looking to join the industry due to the increased leisure time and flexibility UBI enables.\n\nThis might help bridge the upskilling needs in your industry, and we'd be happy to explore potential partnerships or knowledge-sharing opportunities to support your sector's growth and success."}], [{'speaker': 'Fishing', 'status': 'worker', 'message': "I can see how the UBI policy might have a moderate impact on your industry, with potential shifts in consumer behavior and priorities for companies. I'm actually in the fishing industry, and I've been worried about the potential job displacement caused by reduced labor costs - with a UBI policy, there's a possibility that companies might automate more jobs, or reduce hiring in certain sectors. \n\nHow about in the lumber industry? Have you seen any changes in consumer behavior or operations since the UBI was introduced, even if it's still early days?"}, {'speaker': 'Lumber', 'status': 'decision_maker', 'message': "In the lumber industry, we're cautiously optimistic about the UBI policy, and we're seeing some early signs that consumers are indeed prioritizing sustainable practices - which aligns with our own efforts to become more environmentally responsible. However, I must say that our main concern right now is implementing these changes without significantly impacting employment, as we recognize the job displacement challenges that automation and shifts in consumer behavior can bring, similar to what you're worrying about in the fishing industry."}, {'speaker': 'Fishing', 'status': 'worker', 'message': "I totally understand your concerns about job displacement in the lumber industry, and it's interesting to note that we're seeing similar challenges in the fishing industry - where automation is already a pressing issue, and UBI policy might exacerbate the problem. In our industry, we're trying to proactively upskill our workforce to prepare them for the changing job requirements, while also exploring opportunities for workers in other sectors who may be displaced by UBI-driven automation."}, {'speaker': 'Lumber', 'status': 'decision_maker', 'message': '"I think it\'s essential for the lumber and fishing industries to continue having these conversations and exploring ways to mitigate the job displacement challenges together, perhaps through collaborative training programs or even future partnerships to share best practices and resources. Our next steps in the lumber industry will indeed focus on upskilling our workforce and staying attuned to the shifting job market, while also celebrating the positive momentum around sustainability that the UBI policy has brought to our sector."'}], [{'speaker': 'Fishing', 'status': 'worker', 'message': '"I\'ve noticed that with the proposed Universal Basic Income policy, we\'ve seen some job openings being left unfilled in the Fishing industry as some workers may not see a strong enough motivation to continue working if they\'re receiving a guaranteed basic income. Have you seen any changes in consumer behavior in essential goods and services that could impact our industry\'s supply chain?"'}, {'speaker': 'Fishing', 'status': 'decision_maker', 'message': '"I\'ve observed that the recent shifts in consumer behavior, particularly in essential goods and services, are indeed affecting our supply chains. As a decision-maker in the Fishing industry, I\'ve noticed that not only are some workers opting out due to the UBI, but those remaining are also causing increased labor costs, not reduced, due to a sense of security, and higher expectations on working conditions and wages, as a result of this policy."'}, {'speaker': 'Fishing', 'status': 'worker', 'message': "I understand your concern that the increased demand in essential goods and services may be affecting our supply chain, and it's been challenging for us to adapt to these changes. In our industry, we're trying to handle similar issues by retraining and upskilling our existing workforce to focus on more specialized roles, such as fish processing and sustainability management, which can help drive demand for our products."}, {'speaker': 'Fishing', 'status': 'decision_maker', 'message': 'As we move forward, I plan to prioritize investments in workforce retraining and upskilling programs that focus on specialized roles, like fish processing and sustainability management, to not only adapt to the changing demand but also to create more in-demand jobs within our industry. This will not only help retain our existing workforce but also attract new talent and stay competitive in the market.'}], [{'speaker': 'Fishing', 'status': 'consumer', 'message': "I'm concerned that the implementation of UBI might actually have a negative impact on our industry as consumers might spend less on fishing products due to newfound financial security, leading to potential disruption in our supply chains. Can you tell me from the industry's perspective, how you've seen UBI affecting labor markets and workforce availability in our sector, and how that might alter our operations?"}, {'speaker': 'Fishing', 'status': 'decision_maker', 'message': 'From our perspective, the introduction of UBI has led to a shift in labor availability in the fishing industry, with some workers reassessing their priorities and choosing to transition into roles that offer more job security or better work-life balance. This could result in a potential labor shortage, which would require us to adapt our operations and potentially re-evaluate our staffing models to maintain stable supply chains.'}, {'speaker': 'Fishing', 'status': 'consumer', 'message': "I completely understand your concerns about the potential labor shortage in our industry, and I'm facing similar issues at the consumer level. As a consumer, I'm adapting by choosing to buy locally sourced and sustainable fish products to support the industry's stability, even if it means a slightly higher price point."}, {'speaker': 'Fishing', 'status': 'decision_maker', 'message': "To mitigate the potential labor shortage, we're already exploring collaborations with local marine institutes to upskill and reskill existing workers, while also considering more flexible staffing arrangements that allow for better work-life balance. Additionally, we're evaluating pricing strategies to remain competitive and attractive to consumers like you, while ensuring we can continue to support our supply chains and local fishermen."}], [{'speaker': 'Fishing', 'status': 'consumer', 'message': "I've seen a concerning trend in our fishing industry due to potential decreases in demand for our products, which I think could be linked to the UBI - people might have a bit more disposable income to spend on leisure activities rather than food, making our products less appealing to them. What's been your experience like in the transportation industry with this policy in place, do you think it has directly affected operations or changes in consumer behavior have been minimal so far?"}, {'speaker': 'Transportation', 'status': 'decision_maker', 'message': "We've explored a similar scenario in our transportation industry, where the potential ripple effects of a Universal Basic Income weren't as direct as we initially thought, and we've since adjusted our compensation packages and considered implementing more flexible transportation services to adapt to the changing needs of the market. In our case, the shift in consumer behavior due to UBI has been minimal, allowing us to remain relatively unchanged – it might be worth examining similar adaptability options in the fishing industry to mitigate potential impacts from UBI."}, {'speaker': 'Fishing', 'status': 'consumer', 'message': "I appreciate your insight into the transportation industry's adaptability to UBI, where you've focused on adjusting compensation packages and offering more flexible services to complement the changed consumer behavior. In a similar vein, I've been exploring ways to diversify our fishing industry's product line to appeal to changing consumer preferences, while also strengthening our supply chains to mitigate potential disruptions in demand."}, {'speaker': 'Transportation', 'status': 'decision_maker', 'message': '"I think our discussion has highlighted the importance of diversifying and adapting to changing market trends in both our respective industries, and I believe your initiative to strengthen supply chains and diversify products is a great first step - I\'m considering implementing a similar strategy to bolster our transportation network\'s resilience. I\'d like to continue this conversation and explore ways we can collaboratively mitigate the potential disruptions caused by UBI and identify innovative opportunities for growth."'}], [{'speaker': 'Grocery', 'status': 'decision_maker', 'message': "I'd love to discuss the implications of Universal Basic Income on our respective industries. From my perspective, it's the reduced employment and increased costs for the grocery industry that concerns me, as higher taxes and decreased consumer spending power are significant challenges we'd face.\n\nNow, I'm curious about your experience - how do you think the banking industry would adapt to the disruption of low-income payment systems, and the shift from growth-oriented lending to more stable, basic financial services that UBI might bring?"}, {'speaker': 'Banking', 'status': 'decision_maker', 'message': 'As a decision-maker in the banking industry, I see the disruption of low-income payment systems and shift in emphasis towards basic financial services as opportunities for our industry to innovate and adapt, potentially even partnering with other sectors like grocery to offer bundled services and enhance financial inclusion. From my perspective, a stable consumer base with a basic income would actually be a more predictable and secure environment for us, allowing us to focus on long-term relationships rather than high-risk lending practices.'}, {'speaker': 'Grocery', 'status': 'decision_maker', 'message': "I completely understand your optimism about adapting to the changes brought by Universal Basic Income in the banking industry, and I share your sentiment that a stable consumer base could lead to more secure and long-term relationships, which is essential for our own grocery industry's consistent sales. Similarly, we've been exploring strategies to maintain a stable customer base and offer bundled services to help cope with the reduced employment and decreased consumer spending power that UBI might impose on our industry."}, {'speaker': 'Banking', 'status': 'decision_maker', 'message': '"I completely agree that partnering with industries like yours to offer bundled services and promote financial inclusion can be beneficial for both our sectors, and we\'ve actually started exploring a joint initiative with grocery stores to provide financial education and secure payment services to low-income households. In fact, we plan to dedicate a significant portion of our future R&D efforts to developing innovative, cost-effective solutions that cater to the changing financial needs of consumers like those affected by UBI, which I believe can create mutual benefits for both our industries."'}], [{'speaker': 'Grocery', 'status': 'decision_maker', 'message': "Looking at the numbers, I'm concerned that the Universal Basic Income policy could lead to a significant decline in sales for our grocery stores, at least in the short term, as higher taxes would reduce consumer spending power. How have you seen this policy impacting your operations and business strategy, particularly in terms of employee retention and cost management?"}, {'speaker': 'Grocery', 'status': 'decision_maker', 'message': "We're facing a similar concern here, with potential employee layoffs as our budget may not be able to absorb the tax increases – it's already a challenge to maintain competitive salaries, and this could further exacerbate our staffing issues. I'm also worried that our operating costs, including supply chain management, will see a significant spike, which would be difficult to pass on to consumers."}, {'speaker': 'Grocery', 'status': 'decision_maker', 'message': "I completely understand your concerns about employee retention and increased operating costs, and we're facing similar challenges here. To mitigate these issues, we're focusing on strategically optimizing our labor costs and exploring alternative supply chain management options, such as partnering with local, cost-effective suppliers, to help minimize the impact of potential tax increases on our business."}, {'speaker': 'Grocery', 'status': 'decision_maker', 'message': 'As we continue to explore ways to mitigate the potential impact of the Universal Basic Income policy, I plan to accelerate our digital transformation efforts to enhance operational efficiency and mitigate costs, while also pursuing opportunities to raise prices slightly to account for the expected increase in our supply chain costs. We should also consider revisiting our pricing strategy to address potential fluctuations in consumer spending behavior.'}], [{'speaker': 'Grocery', 'status': 'worker', 'message': "I'm curious, how do you think the Universal Basic Income policy will play out in the lumber industry, especially regarding its potential impact on demand and consumer behavior? I've been seeing some shifts in the grocery industry, like increased demand for basic goods and services, which has been causing some strain on our business with higher labor costs and prices."}, {'speaker': 'Lumber', 'status': 'decision_maker', 'message': "From what I've seen in the lumber industry, a Universal Basic Income policy could indeed lead to increased demand for our products, especially home improvement materials, but that surge in demand may be countered by the potential for inflation and increased labor costs to eat into our profit margins as well as passing on higher costs to consumers, similar to what you're experiencing in the grocery industry."}, {'speaker': 'Grocery', 'status': 'worker', 'message': "I can definitely relate to the strain on labor costs and profit margins you're feeling in the lumber industry, it's similar to what's happening in the grocery industry - we've had to get creative with staffing and pricing strategies to keep up with the increased demand for basic goods. We're also considering investing in technology to optimize our supply chain operations and reduce costs, which might be a path worth exploring for your industry as well, considering the potential fluctuations in supply chain operations."}, {'speaker': 'Lumber', 'status': 'decision_maker', 'message': "I think considering the potential fluctuations in supply chain operations due to variable consumer spending, investing in technology to optimize our lumber processing and supply chain management might be a great strategy for our industry, similar to what you're exploring in the grocery industry. I'll be discussing this with our team and exploring options to implement automation and digital solutions to enhance our efficiency and adaptability to changing market conditions."}], [{'speaker': 'Grocery', 'status': 'worker', 'message': "I've seen a noticeable shift in shopping behavior among our customers since the UBI policy was implemented - they're indeed prioritizing essential items over discretionary ones, which is understandable given the guaranteed minimum income. I'd love to hear about your experience, though; have you noticed any changes in sales or consumer spending power, considering the potential impact of higher taxes?"}, {'speaker': 'Grocery', 'status': 'decision_maker', 'message': "From what I've seen, the higher taxes to fund the UBI policy have indeed had an impact on consumer spending power, with many customers feeling the pinch and opting for value-for-money or essential items over our more premium offerings. In terms of sales, we've noticed a slight dip, especially in our discretionary categories, which makes sense given the changed shopping behavior you mentioned."}, {'speaker': 'Grocery', 'status': 'worker', 'message': "I completely understand the challenges you're facing with reduced sales and decreased consumer spending power in the discretionary categories, it's a similar issue we're grappling with here - we've seen a shift in customer priorities and are adjusting our inventory and pricing strategies accordingly.\n\nTo be honest, managing these changes is a bit of a balancing act for us, but we're trying to adapt by offering more affordable essentials and partnering with local suppliers to keep costs low, which seems to be working for now."}, {'speaker': 'Grocery', 'status': 'decision_maker', 'message': '"To be frank, we\'re considering expanding our private-label portfolio to cater to customers who are looking for value-for-money options, and we\'ll also continue to work with local suppliers to keep costs low and maintain competitive pricing for our essential items."'}], [{'speaker': 'Transportation', 'status': 'decision_maker', 'message': "I can understand the concerns you have regarding the Universal Basic Income policy, considering the potential decrease in sales if consumer spending power is reduced. In our transportation industry, we're facing similar challenges, with rising costs and shifting workforce dynamics making it harder for us to adapt - have these changes in employment levels influenced your ability to maintain staffing and operations in your grocery stores?"}, {'speaker': 'Grocery', 'status': 'decision_maker', 'message': "I completely understand your concerns about the Universal Basic Income policy affecting your industry, and I can relate to its impact on our grocery stores' staffing and operations. In our case, we've seen a noticeable shift in the types of labor we need – with more part-time and flexible positions being necessary due to changed consumer behavior patterns."}, {'speaker': 'Transportation', 'status': 'decision_maker', 'message': "I can definitely understand the implications of the Universal Basic Income policy on your grocery stores' ability to attract and retain full-time staff, especially given the shift towards part-time and flexible positions that consumers are demanding. That's similar to our experience in the transportation industry, where we're also struggling to adapt to a changing workforce landscape and balancing our operational needs with the increasing costs and varying schedules of our employees."}, {'speaker': 'Grocery', 'status': 'decision_maker', 'message': '"I\'m planning to invest in more automation and technology within our grocery stores to augment our workforce and improve operational efficiency, which could help offset the potential staffing challenges and costs associated with the Universal Basic Income policy."'}], [{'speaker': 'Transportation', 'status': 'decision_maker', 'message': "I've found that the increased regulations have significantly impacted our ability to maintain competitive pricing for businesses, with many small and medium enterprises starting to feel the pinch. How's it been affecting your operations - are you seeing a shift in customer demand or operational adjustments because of the workforce changes within your organization?"}, {'speaker': 'Transportation', 'status': 'decision_maker', 'message': "I can definitely relate to your concerns about maintaining competitive pricing; in our organization, we've seen a 10% increase in costs due to the regulations, which has led to a squeeze on our profit margins. We're noticing a shift in customer demand towards more flexible, on-demand services, which has forced us to adjust our operational model and invest in new technologies to retain market share."}, {'speaker': 'Transportation', 'status': 'decision_maker', 'message': "I completely understand the challenges you're facing, regarding the increased regulations leading to a 10% cost increase and a shift in customer demand towards more flexible services. Similarly, our organization has seen a significant impact on our pricing strategy and workforce dynamics, forcing us to invest in new technologies to better adapt to the altered demand patterns and maintain competitive pricing for businesses."}, {'speaker': 'Transportation', 'status': 'decision_maker', 'message': "It's been enlightening to exchange experiences with you - we're actually in the process of exploring a similar shift in our operational model by investing more in technology-driven on-demand services to cater to the changing customer demands and mitigate the impact of workforce changes. We're also exploring new pricing strategies and partnerships to help alleviate some of the regulatory burden on businesses within our network."}]
                ];
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
								<div 
									className="absolute w-full mt-1 max-h-60 overflow-y-auto bg-white border rounded-lg shadow-lg z-50"
								>
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
				people={peoplePerProvince[provinceSelected as Provinces] || []}
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
