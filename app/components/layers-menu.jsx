"use client";

import { Button } from "@/components/ui/button";
// import { getAllPeople, getAvatarUrl } from "@smoothui/data";
import {  Layers } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const AVATAR_SIZE = 96;
const EASING_X1 = 0.4;
const EASING_Y1 = 0.0;
const EASING_X2 = 0.2;
const EASING_Y2 = 1;

const getDefaultCards = () => {
    //   const people = getAllPeople();

    return [
        {
            id: 1,
            title: "Summer Opening",
            image:
                "https://res.cloudinary.com/dyzxnud9z/image/upload/w_400,ar_1:1,c_fill,g_auto/v1758210208/smoothui/summer-opening.webp",
            content:
                "Join us for the Summer Opening event, where we celebrate the start of a vibrant season filled with art and culture.",

        },

    ];
};

const smoothEasing = [EASING_X1, EASING_Y1, EASING_X2, EASING_Y2];



export default function ExpandableCards({
    children,
    cards = getDefaultCards(),
    selectedCard: controlledSelected,
    onSelect,
    className = "",
    cardClassName = "",
}) {
    const [internalSelected, setInternalSelected] = useState(null);
    const scrollRef = useRef(null);

    const selectedCard =
        controlledSelected !== undefined ? controlledSelected : internalSelected;

    useEffect(() => {
        if (scrollRef.current) {
            const scrollWidth = scrollRef.current.scrollWidth;
            const clientWidth = scrollRef.current.clientWidth;
            scrollRef.current.scrollLeft = (scrollWidth - clientWidth) / 2;
        }
    }, []);

    const handleCardClick = (id) => {
        if (selectedCard === id) {
            if (onSelect) {
                onSelect(null);
            } else {
                setInternalSelected(null);
            }
        } else {
            if (onSelect) {
                onSelect(id);
            } else {
                setInternalSelected(id);
            }
            // Center the clicked card in view
            const cardElement = document.querySelector(`[data-card-id="${id}"]`);
            if (cardElement) {
                cardElement.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center",
                });
            }
        }
    };

    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className={`flex w-full flex-col gap-4 overflow-hidden  ${className}`}
        >
            <div
                className="scrollbar-hide mx-auto flex overflow-x-auto "
                ref={scrollRef}
                style={{
                    scrollSnapType: "x mandatory",
                    scrollPaddingLeft: "20%",
                }}
            >
                {cards.map((card) => (
                    <motion.div
                        animate={{
                            width: selectedCard === card.id ? "500px" : "",
                            height: selectedCard === card.id ? "500px" : "",

                        }}
                        className={`relative mr-4 h-[80px] shrink-0  overflow-hidden rounded-2xl    ${cardClassName}`}
                        data-card-id={card.id}
                        key={card.id}
                        layout
                        onClick={() => handleCardClick(card.id)}
                        style={{
                            scrollSnapAlign: "start",
                        }}
                        transition={{
                            duration: 0.5,
                            ease: smoothEasing,
                        }}
                    >
                        <div className="relative h-full w-[80px]">

                            <div className="absolute inset-0 " />
                            <div className="absolute inset-0 flex flex-col justify-between  text-white">

                                <div className="flex items-center gap-2">
                                    <button
                                        aria-label="Play video"
                                        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-background/30 backdrop-blur-sm transition-transform hover:scale-110"
                                        type="button"
                                        onClick={() => handleCardClick(card.id)}
                                    >
                                        <Layers className="h-6 w-6 text-white cursor-pointer" />
                                       
                                    </button>
                                </div>
                            </div>
                        </div>
                        <AnimatePresence mode="popLayout">
                            {selectedCard === card.id && (
                                <motion.div
                                    animate={{ width: "500px", opacity: 1, filter: "blur(0px)" }}
                                    className="absolute top-0 right-0 h-full bg-background "
                                    exit={{ width: 0, opacity: 0, filter: "blur(5px)" }}
                                    initial={{ width: 0, opacity: 0, filter: "blur(5px)" }}
                                    transition={{
                                        duration: 0.5,
                                        ease: smoothEasing,
                                        opacity: { duration: 0.3, delay: 0.2 },
                                    }}
                                >
                                    <motion.div
                                        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                        className="flex h-full flex-col items-end  justify-between p-4"
                                        exit={{ opacity: 0, x: 20, filter: "blur(5px)" }}
                                        initial={{ opacity: 0, x: 20, filter: "blur(5px)" }}
                                        transition={{ delay: 0.4, duration: 0.3 }}
                                        onClick={handleContentClick}
                                    >
                                        {children}
                                    <Button onClick={handleCardClick}    className="cursor-pointer w-1/3 "> Close </Button>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
