/* =========================================================
   APTITUDEQUEST
   AGE-WISE IMPORTANT APTITUDE GAME
========================================================= */


/* =========================================================
   GLOBAL SETTINGS
========================================================= */

const TOTAL_LEVELS = 10;
const QUESTIONS_PER_LEVEL = 5;
const MAX_WRONG = 3;   // 3 or more wrong = fail (3 correct out of 5 = pass)
const MAX_WRONG_ALLOWED = MAX_WRONG - 1;   // wrong answers the player may show before failing


/* =========================================================
   GLOBAL STATE
========================================================= */

let currentPlayer = {
    name: "",
    age: 0
};

let currentTopic = null;
let currentLevel = 1;

let questions = [];
let currentQuestionIndex = 0;

let correctAnswers = 0;
let wrongAnswers = 0;

let answeredCurrentQuestion = false;

let clueUsed = false;


/* =========================================================
   BASIC HELPERS
========================================================= */

function byId(id) {
    return document.getElementById(id);
}


function setText(id, text) {
    const element = byId(id);

    if (element) {
        element.textContent = text;
    }
}


function showScreen(screenId) {

    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const screen = byId(screenId);

    if (screen) {
        screen.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   VOICE
========================================================= */

function speakText(text) {

    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-IN";
    speech.rate = 0.9;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
}


/* =========================================================
   AGE-WISE DIFFICULTY
========================================================= */

/*
   IMPORTANT:

   Every age has its own difficulty profile.

   6  = Very Easy
   7  = Very Easy+
   8  = Easy
   9  = Easy+
   10 = Basic
   11 = Basic+
   12 = School Aptitude
   13 = School Aptitude+
   14 = Moderate
   15 = Moderate+
   16 = Advanced
   17 = Advanced+
   18 = Placement Basic
   19 = Placement Basic+
   20 = Placement Moderate
   21 = Placement Moderate+
   22+ = Hard / Expert progression
*/


const AGE_PROFILES = {

    6:  { label: "Very Easy", numberMax: 20, percentMax: 100 },
    7:  { label: "Very Easy+", numberMax: 30, percentMax: 150 },
    8:  { label: "Easy", numberMax: 50, percentMax: 200 },
    9:  { label: "Easy+", numberMax: 75, percentMax: 250 },
    10: { label: "Basic", numberMax: 100, percentMax: 300 },
    11: { label: "Basic+", numberMax: 150, percentMax: 400 },
    12: { label: "School Aptitude", numberMax: 200, percentMax: 500 },
    13: { label: "School Aptitude+", numberMax: 300, percentMax: 600 },
    14: { label: "Moderate", numberMax: 400, percentMax: 700 },
    15: { label: "Moderate+", numberMax: 500, percentMax: 800 },
    16: { label: "Advanced", numberMax: 750, percentMax: 1000 },
    17: { label: "Advanced+", numberMax: 1000, percentMax: 1200 },
    18: { label: "Placement Basic", numberMax: 1500, percentMax: 1500 },
    19: { label: "Placement Basic+", numberMax: 2000, percentMax: 2000 },
    20: { label: "Placement Moderate", numberMax: 3000, percentMax: 3000 },
    21: { label: "Placement Moderate+", numberMax: 5000, percentMax: 5000 }
};


function getAgeProfile(age) {

    age = Number(age);

    if (AGE_PROFILES[age]) {
        return AGE_PROFILES[age];
    }

    if (age >= 22) {

        const extra = age - 21;

        return {
            label: extra <= 3
                ? "Placement Hard"
                : extra <= 8
                    ? "Placement Expert"
                    : "Placement Challenge",

            numberMax: Math.min(
                100000,
                5000 + extra * 2500
            ),

            percentMax: Math.min(
                10000,
                5000 + extra * 1000
            )
        };
    }

    return AGE_PROFILES[6];
}


function getDifficulty(level, age) {

    const profile = getAgeProfile(age);

    return `${profile.label} • Level ${level}`;
}


function getAgeGroup(age) {

    return getAgeProfile(age).label;
}


/* =========================================================
   RANDOM HELPERS
========================================================= */

function randomInt(min, max) {

    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}


function randomChoice(array) {

    return array[
        Math.floor(Math.random() * array.length)
    ];
}


function shuffle(array) {

    const arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {

        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [arr[i], arr[j]] =
            [arr[j], arr[i]];
    }

    return arr;
}


function uniqueOptions(options) {

    const result = [];

    options.forEach(option => {

        const value = String(option);

        if (!result.includes(value)) {
            result.push(value);
        }
    });

    return result;
}


/* =========================================================
   QUESTION CREATOR
========================================================= */

function makeQuestion(
    question,
    options,
    answer,
    explanation,
    clue1,
    clue2,
    clue3
) {

    let finalOptions =
        uniqueOptions(options);

    while (finalOptions.length < 4) {

        finalOptions.push(
            String(randomInt(1, 100))
        );

        finalOptions =
            uniqueOptions(finalOptions);
    }

    finalOptions =
        shuffle(finalOptions.slice(0, 4));

    return {
        question: question,

        options: finalOptions,

        answer: String(answer),

        explanation: explanation,

        clues: [
            clue1 || "Read the question carefully.",
            clue2 || "Break the problem into smaller steps.",
            clue3 || explanation
        ]
    };
}


/* =========================================================
   NUMBERS
========================================================= */

function generateNumbers(age, level) {

    const profile = getAgeProfile(age);

    /* LEVEL 1-2 : BASIC NUMBER OPERATIONS */

    if (level <= 2) {

        if (age <= 8) {

            const a = randomInt(2, 10 + age);
            const b = randomInt(2, 8 + age);

            const answer = a + b;

            return makeQuestion(
                `What is ${a} + ${b}?`,
                [
                    answer,
                    answer + 2,
                    answer - 1,
                    answer + 5
                ],
                answer,
                `${a} + ${b} = ${answer}.`,
                "Add the two numbers.",
                `Calculate ${a} + ${b}.`,
                `Answer = ${answer}.`
            );
        }

        const a = randomInt(20, profile.numberMax);
        const b = randomInt(5, Math.max(10, Math.floor(profile.numberMax / 5)));

        const answer = a - b;

        return makeQuestion(
            `What is ${a} - ${b}?`,
            [
                answer,
                answer + 5,
                answer - 5,
                answer + 10
            ],
            answer,
            `${a} - ${b} = ${answer}.`,
            "Subtract the smaller number.",
            `${a} - ${b}`,
            `Answer = ${answer}.`
        );
    }


    /* LEVEL 3-4 : MULTIPLICATION / DIVISION */

    if (level <= 4) {

        const a =
            randomInt(
                3,
                Math.max(10, Math.floor(profile.numberMax / 20))
            );

        const b =
            randomInt(
                4,
                Math.max(10, Math.floor(profile.numberMax / 15))
            );

        const answer = a * b;

        return makeQuestion(
            `What is ${a} × ${b}?`,
            [
                answer,
                answer + a,
                answer - b,
                answer + 10
            ],
            answer,
            `${a} × ${b} = ${answer}.`,
            "Multiply both numbers.",
            `${a} times ${b}.`,
            `Answer = ${answer}.`
        );
    }


    /* LEVEL 5-6 : DIVISIBILITY */

    if (level <= 6) {

        const divisor =
            randomChoice([2, 3, 5, 7, 10]);

        const multiplier =
            randomInt(
                5,
                Math.max(15, Math.floor(profile.numberMax / divisor))
            );

        const answer =
            divisor * multiplier;

        return makeQuestion(
            `Which number is divisible by ${divisor}?`,
            [
                answer,
                answer + 1,
                answer + 2,
                answer + 3
            ],
            answer,
            `${answer} ÷ ${divisor} = ${multiplier}.`,
            `Check divisibility by ${divisor}.`,
            `Try dividing each option by ${divisor}.`,
            `${answer} is exactly divisible by ${divisor}.`
        );
    }


    /* LEVEL 7-8 : HCF / LCM */

    if (level <= 8) {

        const base =
            randomInt(
                2,
                Math.max(8, Math.floor(profile.numberMax / 50))
            );

        const a = base * 2;
        const b = base * 3;

        const answer = base * 6;

        return makeQuestion(
            `Find the LCM of ${a} and ${b}.`,
            [
                answer,
                base * 4,
                base * 5,
                base * 3
            ],
            answer,
            `LCM(${a}, ${b}) = ${answer}.`,
            "List the multiples of both numbers.",
            `The first common multiple is ${answer}.`,
            `Answer = ${answer}.`
        );
    }


    /* LEVEL 9 : REMAINDER */

    if (level === 9) {

        const divisor =
            randomChoice([5, 6, 7, 8, 9]);

        const remainder =
            randomInt(1, divisor - 1);

        const quotient =
            randomInt(
                5,
                Math.max(10, Math.floor(profile.numberMax / divisor))
            );

        const answer =
            divisor * quotient + remainder;

        return makeQuestion(
            `A number leaves remainder ${remainder} when divided by ${divisor}. Which could be the number?`,
            [
                answer,
                answer + 1,
                answer + 2,
                answer + 3
            ],
            answer,
            `The number is of the form ${divisor}k + ${remainder}.`,
            "Use divisor × quotient + remainder.",
            `${divisor} × ${quotient} + ${remainder}.`,
            `Answer = ${answer}.`
        );
    }


    /* LEVEL 10 : NUMBER SERIES */

    const start =
        randomInt(2, 20);

    const difference =
        randomInt(
            2,
            age >= 18 ? 15 : 8
        );

    const answer =
        start + difference * 5;

    return makeQuestion(
        `Find the next number: ${start}, ${start + difference}, ${start + difference * 2}, ${start + difference * 3}, ${start + difference * 4}, ?`,
        [
            answer,
            answer + difference,
            answer - difference,
            answer + 2
        ],
        answer,
        `The sequence increases by ${difference} each time.`,
        "Find the common difference.",
        `Add ${difference} to the previous number.`,
        `Answer = ${answer}.`
    );
}


/* =========================================================
   PERCENTAGE
========================================================= */

function generatePercentage(age, level) {

    const profile = getAgeProfile(age);

    /* BASIC */

    if (level <= 2) {

        const number =
            randomInt(
                50,
                Math.max(100, profile.percentMax)
            );

        const percent =
            randomChoice(
                age <= 10
                    ? [10, 20]
                    : [10, 20, 25, 50]
            );

        const answer =
            number * percent / 100;

        return makeQuestion(
            `What is ${percent}% of ${number}?`,
            [
                answer,
                answer + 5,
                answer - 5,
                answer + 10
            ],
            answer,
            `${percent}% of ${number} = ${answer}.`,
            "Convert percentage into a fraction.",
            `${number} × ${percent}/100.`,
            `Answer = ${answer}.`
        );
    }


    /* PERCENTAGE INCREASE */

    if (level <= 4) {

        const original =
            randomInt(
                100,
                Math.max(500, profile.percentMax)
            );

        const increase =
            randomChoice([10, 20, 25]);

        const answer =
            original * (100 + increase) / 100;

        return makeQuestion(
            `A value of ${original} is increased by ${increase}%. What is the new value?`,
            [
                answer,
                answer + 10,
                answer - 10,
                answer + 20
            ],
            answer,
            `New value = ${original} × ${(100 + increase)}/100 = ${answer}.`,
            `Find ${increase}% of ${original}.`,
            "Add the increase to the original value.",
            `Answer = ${answer}.`
        );
    }


    /* PERCENTAGE DECREASE */

    if (level <= 6) {

        const original =
            randomInt(
                200,
                Math.max(800, profile.percentMax)
            );

        const decrease =
            randomChoice([10, 15, 20, 25]);

        const answer =
            original * (100 - decrease) / 100;

        return makeQuestion(
            `A price of ₹${original} is reduced by ${decrease}%. What is the new price?`,
            [
                answer,
                answer + 20,
                answer - 20,
                answer + 40
            ],
            answer,
            `${100 - decrease}% of ₹${original} = ₹${answer}.`,
            `${100 - decrease}% remains.`,
            `Calculate ${original} × ${100 - decrease}/100.`,
            `New price = ₹${answer}.`
        );
    }


    /* SUCCESSIVE PERCENTAGE */

    if (level <= 8) {

        const increase =
            randomChoice([10, 20, 25]);

        const decrease =
            randomChoice([10, 20, 25]);

        const finalMultiplier =
            (1 + increase / 100) *
            (1 - decrease / 100);

        const change =
            Math.round(
                (finalMultiplier - 1) * 10000
            ) / 100;

        const answer =
            change < 0
                ? `${Math.abs(change)}% decrease`
                : `${change}% increase`;

        return makeQuestion(
            `A value increases by ${increase}% and then decreases by ${decrease}%. What is the overall percentage change?`,
            [
                answer,
                `${Math.abs(change)}% increase`,
                "No change",
                "5% decrease"
            ],
            answer,
            `Take 100 as the original value and apply both changes.`,
            "Start with 100.",
            `Apply +${increase}% and then -${decrease}%.`,
            `Overall change = ${answer}.`
        );
    }


    /* REVERSE PERCENTAGE */

    const finalValue =
        randomInt(
            400,
            Math.max(1000, profile.percentMax)
        );

    const percent =
        randomChoice([10, 20, 25]);

    const original =
        finalValue * 100 / (100 - percent);

    const roundedOriginal =
        Math.round(original);

    return makeQuestion(
        `After a ${percent}% decrease, a price becomes ₹${finalValue}. What was the original price?`,
        [
            `₹${roundedOriginal}`,
            `₹${roundedOriginal + 50}`,
            `₹${roundedOriginal - 50}`,
            `₹${roundedOriginal + 100}`
        ],
        `₹${roundedOriginal}`,
        `Original = Final × 100 / ${100 - percent}.`,
        "The final value represents the remaining percentage.",
        `Divide ₹${finalValue} by ${100 - percent}% and multiply by 100.`,
        `Original price ≈ ₹${roundedOriginal}.`
    );
}


/* =========================================================
   PROFIT & LOSS
========================================================= */

function generateProfitLoss(age, level) {

    const profile = getAgeProfile(age);

    /* PROFIT */

    if (level <= 2) {

        const cp =
            randomInt(
                100,
                Math.max(500, profile.numberMax)
            );

        const profit =
            randomChoice([10, 20]);

        const sp =
            cp * (100 + profit) / 100;

        return makeQuestion(
            `An article costs ₹${cp}. If the profit is ${profit}%, find the selling price.`,
            [
                `₹${sp}`,
                `₹${sp + 20}`,
                `₹${sp - 20}`,
                `₹${sp + 40}`
            ],
            `₹${sp}`,
            `SP = CP × ${(100 + profit)}/100 = ₹${sp}.`,
            "Profit percentage is calculated on CP.",
            `Multiply ₹${cp} by ${(100 + profit)}/100.`,
            `Selling price = ₹${sp}.`
        );
    }


    /* FIND PROFIT % */

    if (level <= 4) {

        const cp =
            randomInt(
                200,
                Math.max(800, profile.numberMax)
            );

        const profit =
            randomChoice([10, 15, 20, 25]);

        const sp =
            cp * (100 + profit) / 100;

        return makeQuestion(
            `An article is bought for ₹${cp} and sold for ₹${sp}. What is the profit percentage?`,
            [
                `${profit}%`,
                `${profit + 5}%`,
                `${profit - 5}%`,
                `${profit + 10}%`
            ],
            `${profit}%`,
            `Profit = SP - CP = ₹${sp - cp}. Profit% = Profit/CP × 100 = ${profit}%.`,
            "Profit = SP - CP.",
            "Divide profit by CP and multiply by 100.",
            `Profit = ${profit}%.`
        );
    }


    /* LOSS */

    if (level <= 6) {

        const cp =
            randomInt(
                300,
                Math.max(1000, profile.numberMax)
            );

        const loss =
            randomChoice([10, 15, 20]);

        const sp =
            cp * (100 - loss) / 100;

        return makeQuestion(
            `An article costing ₹${cp} is sold at a ${loss}% loss. Find the selling price.`,
            [
                `₹${sp}`,
                `₹${sp + 20}`,
                `₹${sp - 20}`,
                `₹${sp + 40}`
            ],
            `₹${sp}`,
            `SP = CP × ${100 - loss}/100 = ₹${sp}.`,
            "After a loss, less than 100% of CP remains.",
            `Calculate ${cp} × ${100 - loss}/100.`,
            `Selling price = ₹${sp}.`
        );
    }


    /* DISCOUNT */

    if (level <= 8) {

        const mp =
            randomInt(
                500,
                Math.max(1500, profile.numberMax)
            );

        const discount =
            randomChoice([10, 15, 20]);

        const sp =
            mp * (100 - discount) / 100;

        return makeQuestion(
            `An article has a marked price of ₹${mp}. It is sold at a ${discount}% discount. Find the selling price.`,
            [
                `₹${sp}`,
                `₹${sp + 25}`,
                `₹${sp - 25}`,
                `₹${sp + 50}`
            ],
            `₹${sp}`,
            `SP = MP × ${100 - discount}/100 = ₹${sp}.`,
            "Discount is subtracted from marked price.",
            `${100 - discount}% of MP remains.`,
            `Selling price = ₹${sp}.`
        );
    }


    /* PLACEMENT QUESTION */

    const cp = 800;
    const profit = 25;
    const discount = 20;

    const requiredSP =
        cp * 1.25;

    const mp =
        requiredSP / 0.80;

    return makeQuestion(
        `An article costs ₹${cp}. A trader wants ${profit}% profit after giving a ${discount}% discount. What should be the marked price?`,
        [
            `₹${mp}`,
            "₹1200",
            "₹1300",
            "₹1400"
        ],
        `₹${mp}`,
        `Required SP = ₹${requiredSP}. After 20% discount, SP is 80% of MP. MP = ${requiredSP}/0.8 = ₹${mp}.`,
        "First calculate the required selling price.",
        "Then reverse the discount.",
        `Marked price = ₹${mp}.`
    );
}


/* =========================================================
   TIME & WORK
========================================================= */

function generateTimeWork(age, level) {

    /* BASIC */

    if (level <= 2) {

        const days =
            randomInt(
                5,
                age <= 10 ? 15 : 25
            );

        return makeQuestion(
            `A can complete a work in ${days} days. What fraction of the work does A complete in one day?`,
            [
                `1/${days}`,
                `1/${days + 1}`,
                `2/${days}`,
                `1/${days - 1}`
            ],
            `1/${days}`,
            `One day's work = 1/${days}.`,
            "Consider total work as 1.",
            "Divide 1 by the number of days.",
            `Answer = 1/${days}.`
        );
    }


    /* COMBINED WORK */

    if (level <= 5) {

        const a =
            randomInt(
                6,
                age >= 18 ? 20 : 15
            );

        const b =
            randomInt(
                8,
                age >= 18 ? 25 : 18
            );

        const time =
            Math.round(
                (a * b) / (a + b) * 100
            ) / 100;

        return makeQuestion(
            `A can finish a work in ${a} days and B in ${b} days. Approximately how many days will they take together?`,
            [
                `${time} days`,
                `${Math.round(time + 2)} days`,
                `${Math.round(time + 4)} days`,
                `${Math.max(1, Math.round(time - 1))} days`
            ],
            `${time} days`,
            `Combined rate = 1/${a} + 1/${b}. Time = ${time} days approximately.`,
            "Add their one-day work rates.",
            "Take the reciprocal of the combined rate.",
            `Together they take about ${time} days.`
        );
    }


    /* EFFICIENCY */

    if (level <= 7) {

        return makeQuestion(
            `A is twice as efficient as B. If B takes 18 days to complete a work, how many days will A take?`,
            [
                "9 days",
                "6 days",
                "12 days",
                "36 days"
            ],
            "9 days",
            `A is twice as efficient, so A takes half the time: 18/2 = 9 days.`,
            "More efficiency means less time.",
            "A is 2 times as efficient.",
            "Therefore time is halved."
        );
    }


    /* REMAINING WORK */

    if (level <= 9) {

        return makeQuestion(
            `A can complete a work in 10 days and B in 15 days. They work together for 3 days. What fraction of work remains?`,
            [
                "1/2",
                "1/3",
                "2/5",
                "3/5"
            ],
            "1/2",
            `Combined rate = 1/10 + 1/15 = 1/6. In 3 days they complete 1/2. Remaining = 1/2.`,
            "Find their combined daily work.",
            "Multiply the rate by 3.",
            "Subtract completed work from 1.",
            "Remaining work = 1/2."
        );
    }


    /* PLACEMENT WORK PROBLEM */

    return makeQuestion(
        `A can complete a job in 12 days and B in 18 days. A works alone for 4 days. Then B joins A. How many more days are required?`,
        [
            "4.8 days",
            "4 days",
            "5.2 days",
            "3.6 days"
        ],
        "4.8 days",
        `A completes 4/12 = 1/3. Remaining = 2/3. Combined rate = 1/12 + 1/18 = 5/36. Time = (2/3)/(5/36) = 4.8 days.`,
        "Calculate A's work in 4 days.",
        "Find the remaining work.",
        "Divide remaining work by combined rate.",
        "Answer = 4.8 days."
    );
}


/* =========================================================
   SPEED & DISTANCE
========================================================= */

function generateSpeedDistance(age, level) {

    /* BASIC DISTANCE */

    if (level <= 2) {

        const speed =
            randomInt(
                20,
                age <= 10 ? 60 : 100
            );

        const time =
            randomInt(2, 5);

        const distance =
            speed * time;

        return makeQuestion(
            `A car travels at ${speed} km/h for ${time} hours. What distance does it cover?`,
            [
                `${distance} km`,
                `${distance + 10} km`,
                `${distance - 10} km`,
                `${distance + 20} km`
            ],
            `${distance} km`,
            `Distance = Speed × Time = ${speed} × ${time} = ${distance} km.`,
            "Use D = S × T.",
            `Multiply ${speed} by ${time}.`,
            `Distance = ${distance} km.`
        );
    }


    /* AVERAGE SPEED */

    if (level <= 4) {

        const distance =
            randomChoice([120, 180, 240, 300]);

        const time =
            randomChoice([2, 3, 4, 5]);

        const answer =
            distance / time;

        return makeQuestion(
            `A vehicle travels ${distance} km in ${time} hours. What is its average speed?`,
            [
                `${answer} km/h`,
                `${answer + 10} km/h`,
                `${answer - 10} km/h`,
                `${answer + 20} km/h`
            ],
            `${answer} km/h`,
            `Speed = Distance / Time = ${distance}/${time} = ${answer} km/h.`,
            "Use S = D/T.",
            `Divide ${distance} by ${time}.`,
            `Average speed = ${answer} km/h.`
        );
    }


    /* RELATIVE SPEED */

    if (level <= 6) {

        const a =
            randomInt(
                30,
                age >= 18 ? 80 : 60
            );

        const b =
            randomInt(
                20,
                Math.max(25, a - 5)
            );

        const answer = a - b;

        return makeQuestion(
            `Two vehicles move in the same direction at ${a} km/h and ${b} km/h. What is their relative speed?`,
            [
                `${answer} km/h`,
                `${a + b} km/h`,
                `${b} km/h`,
                `${a} km/h`
            ],
            `${answer} km/h`,
            `For same direction, relative speed = difference = ${a} - ${b} = ${answer} km/h.`,
            "Same direction means subtract speeds.",
            `${a} - ${b}.`,
            `Relative speed = ${answer} km/h.`
        );
    }


    /* AVERAGE SPEED OF EQUAL DISTANCES */

    if (level <= 8) {

        return makeQuestion(
            `A person travels equal distances at 30 km/h and 60 km/h. What is the average speed?`,
            [
                "40 km/h",
                "45 km/h",
                "30 km/h",
                "50 km/h"
            ],
            "40 km/h",
            `For equal distances, average speed = 2ab/(a+b) = 2×30×60/90 = 40 km/h.`,
            "Do not simply average 30 and 60.",
            "Use 2ab/(a+b) for equal distances.",
            "Answer = 40 km/h."
        );
    }


    /* TRAIN */

    if (level === 9) {

        const length =
            randomChoice([120, 150, 180, 200]);

        const time =
            randomChoice([5, 6, 8, 10]);

        const speed =
            length / time;

        return makeQuestion(
            `A train ${length} m long crosses a pole in ${time} seconds. What is its speed?`,
            [
                `${speed} m/s`,
                `${speed + 5} m/s`,
                `${speed - 5} m/s`,
                `${speed + 10} m/s`
            ],
            `${speed} m/s`,
            `Speed = distance/time = ${length}/${time} = ${speed} m/s.`,
            "Distance is equal to the train's length.",
            `Divide ${length} by ${time}.`,
            `Speed = ${speed} m/s.`
        );
    }


    /* TRAIN + PLATFORM */

    return makeQuestion(
        `A train 180 m long crosses a 270 m platform in 18 seconds. What is the speed?`,
        [
            "25 m/s",
            "20 m/s",
            "30 m/s",
            "22.5 m/s"
        ],
        "25 m/s",
        `Total distance = 180 + 270 = 450 m. Speed = 450/18 = 25 m/s.`,
        "Add train length and platform length.",
        "Total distance = 450 m.",
        "450 ÷ 18 = 25 m/s."
    );
}


/* =========================================================
   RATIO & PROPORTION
========================================================= */

function generateRatio(age, level) {

    /* BASIC RATIO */

    if (level <= 2) {

        const a =
            randomInt(
                2,
                age <= 10 ? 5 : 8
            );

        const b =
            randomInt(
                3,
                age <= 10 ? 7 : 10
            );

        const multiplier =
            randomInt(2, 10);

        const first =
            a * multiplier;

        const second =
            b * multiplier;

        return makeQuestion(
            `If the ratio of A to B is ${a}:${b} and A = ${first}, find B.`,
            [
                second,
                second + multiplier,
                second - multiplier,
                second + 5
            ],
            second,
            `a:b = ${a}:${b}. Since A = ${first}, one part = ${multiplier}. B = ${b}×${multiplier} = ${second}.`,
            "Find the value of one ratio part.",
            `${first} ÷ ${a} = ${multiplier}.`,
            `B = ${b} × ${multiplier} = ${second}.`
        );
    }


    /* DISTRIBUTION */

    if (level <= 4) {

        const total =
            randomChoice([
                300,
                450,
                600,
                750,
                900
            ]);

        const a = 2;
        const b = 3;

        const answer =
            total * b / (a + b);

        return makeQuestion(
            `Divide ₹${total} in the ratio ${a}:${b}. What is the larger share?`,
            [
                `₹${answer}`,
                `₹${answer - 50}`,
                `₹${answer + 50}`,
                `₹${total / 2}`
            ],
            `₹${answer}`,
            `Total parts = ${a + b}. Larger share = ${b}/${a + b} × ${total} = ₹${answer}.`,
            "Add the ratio parts.",
            `Larger share uses ${b} parts.`,
            `Answer = ₹${answer}.`
        );
    }


    /* COMBINED RATIO */

    if (level <= 6) {

        return makeQuestion(
            `A:B = 3:4 and B:C = 8:9. What is A:C?`,
            [
                "2:3",
                "3:2",
                "4:9",
                "6:9"
            ],
            "2:3",
            `A:B = 6:8 and B:C = 8:9. Therefore A:C = 6:9 = 2:3.`,
            "Make B common.",
            "Convert 3:4 into 6:8.",
            "Compare A and C.",
            "A:C = 2:3."
        );
    }


    /* SUM OF RATIO */

    if (level <= 8) {

        const x = randomInt(3, 8);
        const y = randomInt(x + 1, x + 5);

        const sum =
            (x + y) * randomInt(8, 20);

        const onePart =
            sum / (x + y);

        const larger =
            y * onePart;

        return makeQuestion(
            `Two numbers are in the ratio ${x}:${y}. Their sum is ${sum}. What is the larger number?`,
            [
                larger,
                larger - onePart,
                larger + onePart,
                larger + 10
            ],
            larger,
            `Total parts = ${x + y}. One part = ${sum}/${x + y} = ${onePart}. Larger = ${y}×${onePart} = ${larger}.`,
            "Add the ratio parts.",
            `Find the value of one part.`,
            `Multiply one part by ${y}.`
        );
    }


    /* PLACEMENT RATIO */

    return makeQuestion(
        `A:B = 4:5 and B:C = 10:9. If A + B + C = 690, find B.`,
        [
            "300",
            "250",
            "200",
            "350"
        ],
        "300",
        `A:B = 8:10 and B:C = 10:9. Combined ratio = 8:10:9. B = 10/27 × 690 = 300.`,
        "Make B common.",
        "Combined ratio is 8:10:9.",
        "Total parts = 27.",
        "B = 300."
    );
}


/* =========================================================
   PROBABILITY
========================================================= */

function generateProbability(age, level) {

    /* COIN */

    if (level <= 2) {

        return makeQuestion(
            `A fair coin is tossed once. What is the probability of getting heads?`,
            [
                "1/2",
                "1/3",
                "1/4",
                "2/3"
            ],
            "1/2",
            "There are 2 equally likely outcomes and 1 favourable outcome.",
            "Outcomes are Head and Tail.",
            "Favourable outcomes = 1.",
            "Probability = 1/2."
        );
    }


    /* DIE */

    if (level <= 4) {

        return makeQuestion(
            `A die is rolled once. What is the probability of getting an even number?`,
            [
                "1/2",
                "1/3",
                "2/3",
                "1/6"
            ],
            "1/2",
            "Even outcomes are 2, 4 and 6. So probability = 3/6 = 1/2.",
            "List the even numbers.",
            "There are 3 favourable outcomes.",
            "Probability = 3/6 = 1/2."
        );
    }


    /* BALLS */

    if (level <= 6) {

        const red =
            randomInt(
                2,
                age >= 18 ? 8 : 5
            );

        const blue =
            randomInt(
                2,
                age >= 18 ? 7 : 5
            );

        const total =
            red + blue;

        return makeQuestion(
            `A bag contains ${red} red and ${blue} blue balls. One ball is picked randomly. What is the probability of getting a red ball?`,
            [
                `${red}/${total}`,
                `${blue}/${total}`,
                "1/2",
                `1/${total}`
            ],
            `${red}/${total}`,
            `Total balls = ${total}. Red balls = ${red}. Probability = ${red}/${total}.`,
            "Count total balls.",
            "Count favourable red balls.",
            `Probability = ${red}/${total}.`
        );
    }


    /* TWO COINS */

    if (level <= 8) {

        return makeQuestion(
            `Two fair coins are tossed. What is the probability of getting exactly one head?`,
            [
                "1/2",
                "1/4",
                "3/4",
                "1/3"
            ],
            "1/2",
            "Outcomes are HH, HT, TH and TT. Exactly one head occurs in HT and TH.",
            "List all four outcomes.",
            "There are 2 favourable outcomes.",
            "Probability = 2/4 = 1/2."
        );
    }


    /* TWO DICE */

    if (level === 9) {

        return makeQuestion(
            `Two dice are rolled. What is the probability that the sum is 9?`,
            [
                "1/9",
                "1/12",
                "1/6",
                "1/18"
            ],
            "1/9",
            "Favourable pairs are (3,6), (4,5), (5,4), (6,3). So 4/36 = 1/9.",
            "There are 36 total outcomes.",
            "Find pairs whose sum is 9.",
            "Probability = 4/36 = 1/9."
        );
    }


    /* PLACEMENT */

    return makeQuestion(
        `A box contains 5 red, 4 blue and 3 green balls. One ball is selected randomly. What is the probability of NOT selecting a green ball?`,
        [
            "3/4",
            "1/4",
            "2/3",
            "5/12"
        ],
        "3/4",
        `Total = 12. Non-green = 9. Probability = 9/12 = 3/4.`,
        "Count total balls.",
        "Non-green balls = red + blue.",
        "Probability = 9/12 = 3/4."
    );
}


/* =========================================================
   AVERAGES
========================================================= */

function generateAverage(age, level) {

    /* BASIC */

    if (level <= 2) {

        const a =
            randomInt(10, 30);

        const b =
            a + randomInt(5, 20);

        const c =
            b + randomInt(5, 20);

        const answer =
            (a + b + c) / 3;

        return makeQuestion(
            `Find the average of ${a}, ${b} and ${c}.`,
            [
                answer,
                answer + 5,
                answer - 5,
                answer + 10
            ],
            answer,
            `(${a} + ${b} + ${c}) / 3 = ${answer}.`,
            "Add all values.",
            "Divide the total by 3.",
            `Average = ${answer}.`
        );
    }


    /* TOTAL FROM AVERAGE */

    if (level <= 4) {

        const count =
            randomInt(4, age >= 18 ? 10 : 7);

        const average =
            randomInt(10, 50);

        const total =
            count * average;

        return makeQuestion(
            `The average of ${count} numbers is ${average}. What is their total?`,
            [
                total,
                total + average,
                total - average,
                total + 10
            ],
            total,
            `Total = Average × Number of values = ${average} × ${count} = ${total}.`,
            "Use Total = Average × Count.",
            `${average} × ${count}.`,
            `Total = ${total}.`
        );
    }


    /* REMOVING VALUE */

    if (level <= 6) {

        const count = 4;
        const average = 25;
        const removed = 10;

        const oldTotal =
            count * average;

        const newAverage =
            (oldTotal - removed) /
            (count - 1);

        return makeQuestion(
            `The average of 4 numbers is 25. If one number 10 is removed, what is the average of the remaining numbers?`,
            [
                newAverage,
                25,
                30,
                20
            ],
            newAverage,
            `Old total = 4×25 = 100. Remaining total = 90. Average = 90/3 = ${newAverage}.`,
            "Find the original total.",
            "Subtract the removed number.",
            `New average = ${newAverage}.`
        );
    }


    /* NEW PERSON */

    if (level <= 8) {

        const count = 6;
        const oldAverage = 20;
        const newAverage = 21;

        const oldTotal =
            count * oldAverage;

        const newTotal =
            (count + 1) * newAverage;

        const answer =
            newTotal - oldTotal;

        return makeQuestion(
            `The average age of ${count} students is ${oldAverage}. A new student joins and the average becomes ${newAverage}. What is the new student's age?`,
            [
                answer,
                answer - 1,
                answer + 1,
                answer + 3
            ],
            answer,
            `Old total = ${oldTotal}. New total = ${newTotal}. New student's age = ${newTotal} - ${oldTotal} = ${answer}.`,
            "Find the old total.",
            "Find the new total.",
            `New student's age = ${answer}.`
        );
    }


    /* PLACEMENT AVERAGE */

    return makeQuestion(
        `The average of 8 numbers is 24. If one number is replaced by 40, the average becomes 26. What was the replaced number?`,
        [
            "24",
            "28",
            "32",
            "20"
        ],
        "24",
        `Old total = 192. New total = 208. Increase = 16. Replaced number = 40 - 16 = 24.`,
        "Find old and new totals.",
        "Difference between totals is 16.",
        "40 exceeds the old number by 16.",
        "Old number = 24."
    );
}


/* =========================================================
   LOGICAL REASONING
========================================================= */

function generateLogical(age, level) {

    /* NUMBER SERIES */

    if (level <= 2) {

        const start =
            randomInt(
                2,
                age <= 10 ? 10 : 30
            );

        const difference =
            randomInt(
                2,
                age <= 10 ? 5 : 10
            );

        const n1 = start;
        const n2 = start + difference;
        const n3 = n2 + difference;
        const n4 = n3 + difference;
        const answer = n4 + difference;

        return makeQuestion(
            `Find the next number: ${n1}, ${n2}, ${n3}, ${n4}, ?`,
            [
                answer,
                answer + difference,
                answer - difference,
                answer + 2
            ],
            answer,
            `Each number increases by ${difference}.`,
            "Find the common difference.",
            `Add ${difference} to the last number.`,
            `Answer = ${answer}.`
        );
    }


    /* MULTIPLICATION SERIES */

    if (level <= 4) {

        const start =
            randomInt(2, 8);

        const multiplier =
            randomChoice([2, 3]);

        const n1 = start;
        const n2 = n1 * multiplier;
        const n3 = n2 * multiplier;
        const n4 = n3 * multiplier;
        const answer = n4 * multiplier;

        return makeQuestion(
            `Find the next number: ${n1}, ${n2}, ${n3}, ${n4}, ?`,
            [
                answer,
                answer + 5,
                answer - 5,
                answer * 2
            ],
            answer,
            `Each number is multiplied by ${multiplier}.`,
            "Check multiplication.",
            `${n3} × ${multiplier} = ${answer}.`,
            `Answer = ${answer}.`
        );
    }


    /* ODD ONE OUT */

    if (level <= 6) {

        const n =
            randomInt(3, 10);

        const squares = [
            n * n,
            (n + 1) * (n + 1),
            (n + 2) * (n + 2),
            n * n + 3
        ];

        return makeQuestion(
            `Find the odd one out: ${squares.join(", ")}.`,
            [
                String(n * n + 3),
                String(n * n),
                String((n + 1) * (n + 1)),
                String((n + 2) * (n + 2))
            ],
            String(n * n + 3),
            "Three numbers are perfect squares. One is not.",
            "Check which numbers are squares.",
            `The odd number is ${n * n + 3}.`,
            `Answer = ${n * n + 3}.`
        );
    }


    /* CODING DECODING */

    if (level <= 8) {

        return makeQuestion(
            `If CAT is coded as DBU, how is DOG coded?`,
            [
                "EPH",
                "EOG",
                "FPH",
                "DPG"
            ],
            "EPH",
            "Each letter moves one step forward.",
            "D becomes E.",
            "O becomes P and G becomes H.",
            "DOG → EPH."
        );
    }


    /* ALPHABET SERIES */

    if (level === 9) {

        return makeQuestion(
            `Find the next letter: A, C, E, G, ?`,
            [
                "I",
                "H",
                "J",
                "K"
            ],
            "I",
            "The sequence skips one letter each time.",
            "A → C → E → G.",
            "The next letter is I.",
            "Answer = I."
        );
    }


    /* ARRANGEMENT */

    return makeQuestion(
        `A, B, C, D and E sit in a row. A is left of B. C is right of B. D is left of A. E is right of C. Who sits in the middle?`,
        [
            "B",
            "A",
            "C",
            "D"
        ],
        "B",
        "The order is D, A, B, C, E.",
        "Place D before A.",
        "B comes after A and before C.",
        "Therefore B is in the middle."
    );
}


/* =========================================================
   TOPICS
========================================================= */

const TOPICS = [

    {
        id: "numbers",
        name: "Numbers",
        icon: '<svg viewBox="0 0 64 64"><rect x="14" y="8" width="36" height="48" rx="6" fill="#0c447c"/><rect x="19" y="14" width="26" height="12" rx="3" fill="#85b7eb"/><circle cx="23" cy="34" r="3.5" fill="#e6f1fb"/><circle cx="32" cy="34" r="3.5" fill="#e6f1fb"/><circle cx="41" cy="34" r="3.5" fill="#e6f1fb"/><circle cx="23" cy="44" r="3.5" fill="#e6f1fb"/><circle cx="32" cy="44" r="3.5" fill="#e6f1fb"/><circle cx="41" cy="44" r="3.5" fill="#4dabf7"/></svg>',
        color: "#4dabf7",
        description:
            "Number system, divisibility, LCM, HCF, remainders and number series."
    },

    {
        id: "logical",
        name: "Logical Reasoning",
        icon: '<svg viewBox="0 0 64 64"><path d="M22 12c-4 0-7 3-7 7 0 2 .7 3.6 1.8 4.8C13.6 25 11 28.2 11 32c0 4.4 3.6 8 8 8h2v6c0 3.3 2.7 6 6 6s6-2.7 6-6v-6h4v6c0 3.3 2.7 6 6 6s6-2.7 6-6v-6h2c4.4 0 8-3.6 8-8 0-3.8-2.6-7-6.1-7.9 1.1-1.2 1.8-2.8 1.8-4.6 0-4-3-7-7-7-2.1 0-4 .9-5.3 2.3C41.4 17.9 38.4 15 34.7 15h-5.4c-3.7 0-6.7 2.9-7.6 6.3-1.3-1.4-3.1-2.3-5.3-2.3z" fill="#cecbf6"/><circle cx="25" cy="26" r="3" fill="#26215c"/><circle cx="39" cy="26" r="3" fill="#26215c"/><path d="M24 36c2.5 3 5.5 4.5 8 4.5s5.5-1.5 8-4.5" stroke="#26215c" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
        color: "#9775fa",
        description:
            "Series, coding-decoding, patterns and logical reasoning."
    },

    {
        id: "percentage",
        name: "Percentage",
        icon: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#633806"/><path d="M32 10a22 22 0 0 1 19.1 33L32 32z" fill="#facd75"/><circle cx="32" cy="32" r="12" fill="#1c1934"/><text x="32" y="37" font-size="13" fill="#ffd166" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold">%</text></svg>',
        color: "#ffa94d",
        description:
            "Percentage, increase, decrease, successive and reverse percentage."
    },

    {
        id: "profitloss",
        name: "Profit & Loss",
        icon: '<svg viewBox="0 0 64 64"><ellipse cx="22" cy="46" rx="14" ry="5" fill="#173404"/><rect x="8" y="30" width="28" height="16" rx="8" fill="#3b6d11"/><ellipse cx="22" cy="30" rx="14" ry="5" fill="#97c459"/><text x="22" y="34" font-size="9" fill="#173404" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold">$</text><path d="M45 40 L54 26 L63 40 M54 26 V52" stroke="#97c459" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        color: "#51cf66",
        description:
            "Profit, loss, discount, marked price and selling price."
    },

    {
        id: "timework",
        name: "Time & Work",
        icon: '<svg viewBox="0 0 64 64"><circle cx="25" cy="34" r="18" fill="#72243e"/><circle cx="25" cy="34" r="14" fill="#f4c0d1"/><path d="M25 24v11l7 5" stroke="#72243e" stroke-width="3" fill="none" stroke-linecap="round"/><g fill="#ed93b1"><circle cx="47" cy="18" r="9"/><rect x="44" y="3" width="6" height="6" rx="1"/><rect x="44" y="27" width="6" height="6" rx="1"/><rect x="32" y="10" width="6" height="6" rx="1" transform="rotate(-45 35 13)"/><rect x="57" y="10" width="6" height="6" rx="1" transform="rotate(45 60 13)"/></g><circle cx="47" cy="18" r="4" fill="#72243e"/></svg>',
        color: "#ff6b9d",
        description:
            "Work rates, efficiency, combined work and remaining work."
    },

    {
        id: "speed",
        name: "Speed & Distance",
        icon: '<svg viewBox="0 0 64 64"><path d="M8 42a24 24 0 0 1 48 0" fill="none" stroke="#791f1f" stroke-width="8" stroke-linecap="round"/><path d="M8 42a24 24 0 0 1 31-23" fill="none" stroke="#f09595" stroke-width="8" stroke-linecap="round"/><circle cx="32" cy="42" r="4.5" fill="#f09595"/><path d="M32 42 L47 23" stroke="#f09595" stroke-width="3.5" stroke-linecap="round"/></svg>',
        color: "#ff6b6b",
        description:
            "Speed, distance, average speed, relative speed and trains."
    },

    {
        id: "ratio",
        name: "Ratio & Proportion",
        icon: '<svg viewBox="0 0 64 64"><rect x="30" y="9" width="4" height="40" fill="#085041"/><path d="M11 20h42" stroke="#085041" stroke-width="3"/><path d="M4 22l7-9 7 9z" fill="#5dcaa5"/><path d="M46 22l7-9 7 9z" fill="#5dcaa5"/><path d="M4 22a7 9 0 0 0 14 0z" fill="#085041"/><path d="M46 22a7 9 0 0 0 14 0z" fill="#085041"/><rect x="20" y="49" width="24" height="6" rx="2" fill="#085041"/></svg>',
        color: "#63e6be",
        description:
            "Ratios, distribution, combined ratios and proportions."
    },

    {
        id: "probability",
        name: "Probability",
        icon: '<svg viewBox="0 0 64 64"><g transform="rotate(-10 20 36)"><rect x="8" y="24" width="24" height="24" rx="5" fill="#854f0b"/><rect x="10" y="26" width="20" height="20" rx="4" fill="#fac775"/><circle cx="15" cy="31" r="2" fill="#854f0b"/><circle cx="25" cy="41" r="2" fill="#854f0b"/></g><rect x="32" y="14" width="26" height="26" rx="5" fill="#854f0b"/><rect x="34" y="16" width="22" height="22" rx="4" fill="#faeeda"/><circle cx="41" cy="23" r="2.2" fill="#854f0b"/><circle cx="51" cy="23" r="2.2" fill="#854f0b"/><circle cx="41" cy="33" r="2.2" fill="#854f0b"/><circle cx="51" cy="33" r="2.2" fill="#854f0b"/><circle cx="46" cy="28" r="2.2" fill="#854f0b"/></svg>',
        color: "#ffd43b",
        description:
            "Coins, dice, balls and important probability problems."
    },

    {
        id: "average",
        name: "Averages",
        icon: '<svg viewBox="0 0 64 64"><rect x="8" y="34" width="10" height="18" rx="2" fill="#042c53"/><rect x="23" y="22" width="10" height="30" rx="2" fill="#378add"/><rect x="38" y="30" width="10" height="22" rx="2" fill="#042c53"/><rect x="53" y="16" width="10" height="36" rx="2" fill="#378add"/><line x1="4" y1="28" x2="62" y2="28" stroke="#b5d4f4" stroke-width="2" stroke-dasharray="4 3"/></svg>',
        color: "#74c0fc",
        description:
            "Average, total, replacement and weighted-style problems."
    }

];


/* =========================================================
   MAIN QUESTION GENERATOR
========================================================= */

function generateQuestion(topicId, age, level) {

    switch (topicId) {

        case "numbers":
            return generateNumbers(age, level);

        case "logical":
            return generateLogical(age, level);

        case "percentage":
            return generatePercentage(age, level);

        case "profitloss":
            return generateProfitLoss(age, level);

        case "timework":
            return generateTimeWork(age, level);

        case "speed":
            return generateSpeedDistance(age, level);

        case "ratio":
            return generateRatio(age, level);

        case "probability":
            return generateProbability(age, level);

        case "average":
            return generateAverage(age, level);

        default:
            return generateNumbers(age, level);
    }
}


/* =========================================================
   CREATE UNIQUE QUESTION SET
========================================================= */

function createQuestionSet(topicId, level) {

    const result = [];

    let safety = 0;

    while (
        result.length < QUESTIONS_PER_LEVEL &&
        safety < 200
    ) {

        const question =
            generateQuestion(
                topicId,
                currentPlayer.age,
                level
            );

        const exists =
            result.some(
                q => q.question === question.question
            );

        if (!exists) {
            result.push(question);
        }

        safety++;
    }


    /*
       Extra protection.

       If random generator accidentally
       produces duplicate questions, regenerate.
    */

    while (result.length < QUESTIONS_PER_LEVEL) {

        const question =
            generateQuestion(
                topicId,
                currentPlayer.age,
                level
            );

        question.question +=
            ` — Set ${Date.now()}-${result.length + 1}`;

        result.push(question);
    }

    return shuffle(result);
}


/* =========================================================
   AGE-AWARE STORAGE KEYS
========================================================= */

function getProgressPrefix() {

    return `AQ_${currentPlayer.age}_${currentTopic}`;
}


function getUnlockedKey() {

    return `${getProgressPrefix()}_unlocked`;
}


function getLevelKey(level) {

    return `${getProgressPrefix()}_level_${level}`;
}


function getTopicCompletedCount(topicId) {

    let count = 0;

    for (let level = 1; level <= TOTAL_LEVELS; level++) {

        const key = `AQ_${currentPlayer.age}_${topicId}_level_${level}`;

        if (localStorage.getItem(key) === "completed") {
            count++;
        }
    }

    return count;
}


/* =========================================================
   START LEVEL
========================================================= */

function startLevel(level) {

    currentLevel = Number(level);

    questions =
        createQuestionSet(
            currentTopic,
            currentLevel
        );

    currentQuestionIndex = 0;

    correctAnswers = 0;
    wrongAnswers = 0;

    answeredCurrentQuestion = false;

    clueUsed = false;

    showScreen("quizScreen");


    const profile =
        getAgeProfile(
            currentPlayer.age
        );


    setText(
        "levelBadge",
        `Level ${currentLevel}`
    );


    setText(
        "playerInfoQuiz",
        `${currentPlayer.name} • Age ${currentPlayer.age} • ${profile.label}`
    );


    displayQuestion();

    speakText(
        `Level ${currentLevel}. Get ready.`
    );
}


/* =========================================================
   DISPLAY QUESTION
========================================================= */

function displayQuestion() {

    const question =
        questions[currentQuestionIndex];

    if (!question) {

        finishLevel(true);

        return;
    }


    answeredCurrentQuestion = false;


    setText(
        "questionNumber",
        `Question ${currentQuestionIndex + 1} / ${QUESTIONS_PER_LEVEL}`
    );


    setText(
        "questionScore",
        `Score: ${correctAnswers}`
    );


    setText(
        "questionWrong",
        `Wrong: ${Math.min(wrongAnswers, MAX_WRONG_ALLOWED)} / ${MAX_WRONG_ALLOWED}`
    );


    const progress =
        ((currentQuestionIndex + 1) /
            QUESTIONS_PER_LEVEL) * 100;


    const progressBar =
        byId("progressBar");

    if (progressBar) {

        progressBar.style.width =
            `${progress}%`;
    }


    setText(
        "questionText",
        question.question
    );


    const optionsContainer =
        byId("optionsContainer");

    if (!optionsContainer) {
        return;
    }


    optionsContainer.innerHTML = "";


    question.options.forEach(
        (option, index) => {

            const button =
                document.createElement("button");

            button.className =
                "option-button";

            button.innerHTML =
                `<strong>${String.fromCharCode(65 + index)}.</strong> ${option}`;

            button.onclick = () => {

                selectAnswer(
                    option,
                    button
                );
            };

            optionsContainer.appendChild(
                button
            );
        }
    );


    setText(
        "feedback",
        ""
    );


    setText(
        "clueText",
        ""
    );


    const feedback =
        byId("feedback");

    if (feedback) {
        feedback.className =
            "feedback";
    }


    const nextButton =
        byId("nextButton");

    if (nextButton) {
        nextButton.disabled = true;
    }


    resetClues();
}


/* =========================================================
   SELECT ANSWER
========================================================= */

function selectAnswer(
    selectedAnswer,
    clickedButton
) {

    if (answeredCurrentQuestion) {
        return;
    }


    answeredCurrentQuestion = true;


    const question =
        questions[currentQuestionIndex];


    const isCorrect =
        String(selectedAnswer) ===
        String(question.answer);


    document
        .querySelectorAll(".option-button")
        .forEach(button => {

            button.disabled = true;
        });


    if (isCorrect) {

        correctAnswers++;

        clickedButton.classList.add(
            "correct"
        );


        const feedback =
            byId("feedback");


        if (feedback) {

            feedback.className =
                "feedback correct";

            feedback.textContent =
                `✅ Correct! ${question.explanation}`;
        }


        speakText(
            "Correct answer!"
        );

    } else {

        wrongAnswers++;

        clickedButton.classList.add(
            "wrong"
        );


        document
            .querySelectorAll(".option-button")
            .forEach(button => {

                if (
                    button.textContent.includes(
                        String(question.answer)
                    )
                ) {

                    button.classList.add(
                        "correct"
                    );
                }
            });


        const feedback =
            byId("feedback");


        if (feedback) {

            feedback.className =
                "feedback wrong";

            feedback.textContent =
                `❌ Wrong! Correct answer: ${question.answer}. ${question.explanation}`;
        }


        speakText(
            "Wrong answer!"
        );
    }


    setText(
        "questionScore",
        `Score: ${correctAnswers}`
    );


    setText(
        "questionWrong",
        `Wrong: ${Math.min(wrongAnswers, MAX_WRONG_ALLOWED)} / ${MAX_WRONG_ALLOWED}`
    );


    const nextButton =
        byId("nextButton");


    if (nextButton) {

        nextButton.disabled = false;
    }


    /*
       MAX WRONG REACHED = IMMEDIATE FAIL
    */

    if (wrongAnswers >= MAX_WRONG) {

        if (nextButton) {
            nextButton.disabled = true;
        }

        finishLevel(false);
    }
}


/* =========================================================
   NEXT QUESTION
========================================================= */

function nextQuestion() {

    if (!answeredCurrentQuestion) {
        return;
    }


    


    currentQuestionIndex++;


    if (
        currentQuestionIndex >=
        QUESTIONS_PER_LEVEL
    ) {

        finishLevel(true);

        return;
    }


    displayQuestion();
}


/* =========================================================
   FINISH LEVEL
========================================================= */

function finishLevel(passed) {

    if (
        passed &&
        wrongAnswers >= MAX_WRONG
    ) {

        passed = false;
    }


    if (passed) {

        localStorage.setItem(
            getLevelKey(currentLevel),
            "completed"
        );


        unlockNextLevel();


        speakText(
            "Congratulations! You have passed this level."
        );

    } else {

        speakText(
            "Oops! You failed this level. Please retry."
        );
    }


    showResult(passed);
}


/* =========================================================
   UNLOCK NEXT LEVEL
========================================================= */

function unlockNextLevel() {

    const currentUnlocked =
        getUnlockedLevel();


    if (
        currentLevel >=
        currentUnlocked
    ) {

        const nextLevel =
            Math.min(
                currentLevel + 1,
                TOTAL_LEVELS
            );


        localStorage.setItem(
            getUnlockedKey(),
            String(nextLevel)
        );
    }
}


/* =========================================================
   RESULT
========================================================= */

function showResult(passed) {

    showScreen(
        "resultScreen"
    );


    const answered =
        correctAnswers + wrongAnswers;


    const accuracy =
        answered > 0
            ? Math.round(
                (correctAnswers / answered) * 100
            )
            : 0;


    setText(
        "finalLevelScore",
        currentLevel
    );


    setText(
        "correctCount",
        correctAnswers
    );


    setText(
        "wrongCount",
        wrongAnswers
    );


    setText(
        "accuracyCount",
        `${accuracy}%`
    );


    setText(
        "resultPlayer",
        currentPlayer.name
    );


    const icon =
        byId("resultIcon");

    const title =
        byId("resultTitle");

    const message =
        byId("resultMessage");


    if (passed) {

        if (icon) {
            icon.textContent = "🎉";
        }


        if (title) {

            title.textContent =
                currentLevel === TOTAL_LEVELS
                    ? "🏆 Quest Completed!"
                    : "🎉 Level Passed!";
        }


        if (message) {

            message.textContent =
                currentLevel === TOTAL_LEVELS
                    ? "Amazing! You completed all 10 levels."
                    : "Congratulations! Next level is unlocked.";
        }

    } else {

        if (icon) {
            icon.textContent = "😢";
        }


        if (title) {

            title.textContent =
                "Oops! Level Failed";
        }


        if (message) {

            message.textContent =
                "You got 3 or more wrong answers. You need at least 3 correct out of 5. Retry this level with a new question set.";
        }
    }


    createResultButtons(
        passed
    );
}


/* =========================================================
   RESULT BUTTONS
========================================================= */

function createResultButtons(
    passed
) {

    const container =
        byId("resultButtons");

    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!passed) {

        const retry =
            document.createElement("button");

        retry.className =
            "retry-result-button";

        retry.textContent =
            "🔄 Retry Level";


        retry.onclick = () => {

            startLevel(
                currentLevel
            );
        };


        container.appendChild(
            retry
        );

    } else {

        if (
            currentLevel <
            TOTAL_LEVELS
        ) {

            const next =
                document.createElement("button");

            next.className =
                "next-result-button";

            next.textContent =
                "🚀 Next Level";


            next.onclick = () => {

                startLevel(
                    currentLevel + 1
                );
            };


            container.appendChild(
                next
            );

        } else {

            const topicButton =
                document.createElement("button");

            topicButton.className =
                "topic-result-button";

            topicButton.textContent =
                "📚 Choose Another Topic";


            topicButton.onclick = () => {

                goToTopics();
            };


            container.appendChild(
                topicButton
            );
        }
    }


    const mapButton =
        document.createElement("button");


    mapButton.className =
        "topic-result-button";


    mapButton.textContent =
        "🗺️ View Level Map";


    mapButton.onclick = () => {

        openTopic(
            currentTopic
        );
    };


    container.appendChild(
        mapButton
    );


    const homeButton =
        document.createElement("button");


    homeButton.className =
        "home-result-button";


    homeButton.textContent =
        "🏠 Home";


    homeButton.onclick = () => {

        goHome();
    };


    container.appendChild(
        homeButton
    );
}


/* =========================================================
   CLUES
========================================================= */

function resetClues() {

    const button =
        byId("clueBtn");


    if (button) {

        button.disabled =
            clueUsed;


        button.textContent =
            "💡 Show Clue";
    }
}


function useClue() {

    if (clueUsed) {
        return;
    }


    const question =
        questions[currentQuestionIndex];


    if (!question) {
        return;
    }


    clueUsed = true;


    const clueText =
        byId("clueText");


    if (clueText) {

        clueText.textContent =
            question.clue;
    }


    const button =
        byId("clueBtn");


    if (button) {

        button.disabled = true;

        button.textContent =
            "✓ Clue Used";
    }
}


/* =========================================================
   SPEAK QUESTION
========================================================= */

function speakQuestion() {

    const question =
        questions[currentQuestionIndex];


    if (!question) {
        return;
    }


    speakText(
        question.question
    );
}


/* =========================================================
   START GAME
========================================================= */

function startGame() {

    const nameInput =
        byId("nameInput");

    const ageInput =
        byId("ageInput");


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";


    const age =
        ageInput
            ? Number(ageInput.value)
            : 0;


    if (!name) {

        setText(
            "ageMessage",
            "Please enter your name."
        );

        return;
    }


    if (
        !age ||
        !Number.isInteger(age) ||
        age < 6 ||
        age > 80
    ) {

        setText(
            "ageMessage",
            "Please enter a valid whole-number age between 6 and 80."
        );

        return;
    }


    currentPlayer = {
        name: name,
        age: age
    };


    localStorage.setItem(
        "AQ_player",
        JSON.stringify(
            currentPlayer
        )
    );


    const profile =
        getAgeProfile(age);


    setText(
        "ageMessage",
        `Age ${age} selected • ${profile.label}`
    );


    renderTopics();

    showScreen(
        "topicScreen"
    );
}


/* =========================================================
   RENDER TOPICS
========================================================= */

function renderTopics() {

    const grid =
        byId("topicGrid");


    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    TOPICS.forEach(topic => {

        const card =
            document.createElement("div");


        card.className =
            "topic-card";


        card.style.setProperty(
            "--accent",
            topic.color || "#ffd166"
        );


        const done =
            getTopicCompletedCount(topic.id);

        const pct =
            Math.round((done / TOTAL_LEVELS) * 100);


        card.innerHTML = `

            <div class="gate-arch">
                <div class="gate-glow"></div>
                <div class="gate-icon">${topic.icon}</div>
            </div>

            <h3>
                ${topic.name}
            </h3>

            <p>
                ${topic.description}
            </p>

            <div class="topic-progress-track">
                <div class="topic-progress-fill" style="width:${pct}%"></div>
            </div>

            <div class="topic-meta">
                <span>${done}/${TOTAL_LEVELS} quests cleared</span>
                <span>5 Q/level</span>
            </div>
        `;


        card.onclick = () => {

            openTopic(
                topic.id
            );
        };


        grid.appendChild(
            card
        );
    });


    const profile =
        getAgeProfile(
            currentPlayer.age
        );


    setText(
        "playerInfoTopic",
        `${currentPlayer.name} • Age ${currentPlayer.age} • ${profile.label}`
    );
}


/* =========================================================
   OPEN TOPIC
========================================================= */

function openTopic(topicId) {

    currentTopic =
        topicId;


    const topic =
        TOPICS.find(
            t => t.id === topicId
        );


    if (!topic) {

        console.error(
            "Topic not found:",
            topicId
        );

        return;
    }


    const profile =
        getAgeProfile(
            currentPlayer.age
        );


    const mapTopicTitle =
        byId("mapTopicTitle");

    if (mapTopicTitle) {

        mapTopicTitle.innerHTML =
            `<span class="map-topic-icon">${topic.icon}</span> ${topic.name}`;
    }


    setText(
        "mapTopicDescription",
        `${topic.description} • Age ${currentPlayer.age} • ${profile.label}`
    );


    showScreen(
        "levelScreen"
    );


    renderLevelMap();
}


/* =========================================================
   GET UNLOCKED LEVEL
========================================================= */

function getUnlockedLevel() {

    const value =
        Number(
            localStorage.getItem(
                getUnlockedKey()
            ) || 1
        );


    if (!Number.isFinite(value)) {
        return 1;
    }


    return Math.min(
        Math.max(1, Math.round(value)),
        TOTAL_LEVELS
    );
}


/* =========================================================
   RENDER LEVEL MAP
========================================================= */

function renderLevelMap() {

    const path =
        byId("levelPath");


    if (!path) {

        console.error(
            "levelPath not found in HTML"
        );

        return;
    }


    path.innerHTML = "";


    const unlocked =
        getUnlockedLevel();


    for (
        let level = 1;
        level <= TOTAL_LEVELS;
        level++
    ) {

        const node =
            document.createElement(
                "button"
            );


        node.type =
            "button";


        node.className =
            "level-node";


        const completed =
            localStorage.getItem(
                getLevelKey(level)
            ) === "completed";


        if (completed) {

            node.classList.add(
                "completed"
            );
        }


        if (
            level === unlocked
        ) {

            node.classList.add(
                "current"
            );
        }


        if (
            level > unlocked
        ) {

            node.classList.add(
                "locked"
            );


            node.disabled =
                true;


            node.innerHTML = `
                🔒
                <span>Level ${level}</span>
            `;

        } else {

            node.innerHTML = `
                ${completed ? "⭐" : level}
                <span>Level ${level}</span>
            `;


            node.onclick = () => {

                startLevel(
                    level
                );
            };
        }


        path.appendChild(
            node
        );
    }


    path.style.display =
        "grid";


    path.style.visibility =
        "visible";


    path.style.opacity =
        "1";
}


/* =========================================================
   EXIT QUIZ
========================================================= */

function exitQuiz() {

    const confirmExit =
        confirm(
            "Are you sure you want to exit this level?"
        );


    if (!confirmExit) {
        return;
    }


    if (
        "speechSynthesis" in window
    ) {

        speechSynthesis.cancel();
    }


    if (currentTopic) {

        openTopic(
            currentTopic
        );

    } else {

        goToTopics();
    }
}


/* =========================================================
   NAVIGATION
========================================================= */

function goHome() {

    if (
        "speechSynthesis" in window
    ) {

        speechSynthesis.cancel();
    }


    showScreen(
        "homeScreen"
    );
}


function goToTopics() {

    if (
        "speechSynthesis" in window
    ) {

        speechSynthesis.cancel();
    }


    renderTopics();


    showScreen(
        "topicScreen"
    );
}


function continueQuest() {

    if (currentTopic) {

        openTopic(
            currentTopic
        );

    } else {

        goToTopics();
    }
}


/* =========================================================
   FIREBASE LEADERBOARD
========================================================= */

async function saveScore() {

    try {

        if (
            !window.firebaseDB ||
            !window.firebaseTools
        ) {
            return;
        }


        const {
            collection,
            addDoc
        } =
            window.firebaseTools;


        await addDoc(
            collection(
                window.firebaseDB,
                "leaderboard"
            ),
            {
                name:
                    currentPlayer.name,

                age:
                    currentPlayer.age,

                score:
                    correctAnswers,

                level:
                    currentLevel,

                topic:
                    currentTopic,

                timestamp:
                    Date.now()
            }
        );

    } catch (error) {

        console.error(
            "Leaderboard save error:",
            error
        );
    }
}


/* =========================================================
   LOAD LEADERBOARD
========================================================= */

async function loadLeaderboard() {

    const list =
        byId(
            "leaderboardList"
        );


    if (!list) {
        return;
    }


    list.innerHTML =
        `<p class="loading-text">Loading leaderboard...</p>`;


    try {

        if (
            !window.firebaseDB ||
            !window.firebaseTools
        ) {

            list.innerHTML =
                `<p class="loading-text">
                    Leaderboard is not available right now.
                </p>`;

            return;
        }


        const {
            collection,
            getDocs,
            query,
            orderBy,
            limit
        } =
            window.firebaseTools;


        const leaderboardQuery =
            query(
                collection(
                    window.firebaseDB,
                    "leaderboard"
                ),

                orderBy(
                    "score",
                    "desc"
                ),

                limit(20)
            );


        const snapshot =
            await getDocs(
                leaderboardQuery
            );


        list.innerHTML = "";


        if (snapshot.empty) {

            list.innerHTML =
                `<p class="loading-text">
                    No scores yet. Be the first!
                </p>`;

            return;
        }


        let rank = 1;


        snapshot.forEach(doc => {

            const data =
                doc.data();


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "leaderboard-item";


            item.innerHTML = `

                <div class="leaderboard-rank">
                    ${
                        rank <= 3
                            ? ["🥇", "🥈", "🥉"][rank - 1]
                            : rank
                    }
                </div>

                <div class="leaderboard-name">

                    <strong>
                        ${escapeHTML(
                            data.name ||
                            "Player"
                        )}
                    </strong>

                    <small style="
                        display:block;
                        color:#888;
                        margin-top:4px;
                    ">
                        ${escapeHTML(
                            data.topic ||
                            ""
                        )}
                        • Level ${data.level || 1}
                        • Age ${data.age || ""}
                    </small>

                </div>

                <div class="leaderboard-score">
                    ${data.score || 0}/5
                </div>
            `;


            list.appendChild(
                item
            );


            rank++;
        });


    } catch (error) {

        console.error(
            "Leaderboard error:",
            error
        );


        list.innerHTML =
            `<p class="loading-text">
                Unable to load leaderboard.
            </p>`;
    }
}


/* =========================================================
   SHOW LEADERBOARD
========================================================= */

function showLeaderboard() {

    showScreen(
        "leaderboardScreen"
    );


    loadLeaderboard();
}


/* =========================================================
   SAFE HTML
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   RESTORE PLAYER
========================================================= */

function restorePlayer() {

    try {

        const saved =
            localStorage.getItem(
                "AQ_player"
            );


        if (!saved) {
            return;
        }


        const player =
            JSON.parse(
                saved
            );


        if (
            player &&
            player.name &&
            player.age
        ) {

            currentPlayer =
                player;


            const nameInput =
                byId(
                    "nameInput"
                );


            const ageInput =
                byId(
                    "ageInput"
                );


            if (nameInput) {

                nameInput.value =
                    player.name;
            }


            if (ageInput) {

                ageInput.value =
                    player.age;
            }


            updatePreview();
        }

    } catch (error) {

        console.error(
            "Player restore error:",
            error
        );
    }
}


/* =========================================================
   PREVIEW
========================================================= */

function updatePreview() {

    const nameInput =
        byId(
            "nameInput"
        );


    const ageInput =
        byId(
            "ageInput"
        );


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";


    const age =
        ageInput
            ? ageInput.value
            : "";


    setText(
        "previewName",
        name || "Player"
    );


    setText(
        "previewAge",
        age
            ? `Age ${age}`
            : "Age not set"
    );
}


/* =========================================================
   RESET ALL PROGRESS
========================================================= */

function resetAllProgress() {

    const confirmed =
        confirm(
            "This will delete all AptitudeQuest progress for all ages. Continue?"
        );


    if (!confirmed) {
        return;
    }


    /*
       Remove old progress format too.
    */

    TOPICS.forEach(topic => {

        localStorage.removeItem(
            `AQ_${topic.id}_unlocked`
        );


        for (
            let level = 1;
            level <= TOTAL_LEVELS;
            level++
        ) {

            localStorage.removeItem(
                `AQ_${topic.id}_level_${level}`
            );
        }
    });


    /*
       Remove age-specific progress.
    */

    for (
        let age = 6;
        age <= 80;
        age++
    ) {

        TOPICS.forEach(topic => {

            localStorage.removeItem(
                `AQ_${age}_${topic.id}_unlocked`
            );


            for (
                let level = 1;
                level <= TOTAL_LEVELS;
                level++
            ) {

                localStorage.removeItem(
                    `AQ_${age}_${topic.id}_level_${level}`
                );
            }
        });
    }


    alert(
        "All AptitudeQuest progress has been reset."
    );


    if (currentTopic) {

        renderLevelMap();
    }
}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        restorePlayer();


        const nameInput =
            byId(
                "nameInput"
            );


        const ageInput =
            byId(
                "ageInput"
            );


        const startButton =
            byId(
                "startQuestButton"
            );


        const leaderboardButton =
            byId(
                "leaderboardButton"
            );


        if (nameInput) {

            nameInput.addEventListener(
                "input",
                updatePreview
            );
        }


        if (ageInput) {

            ageInput.addEventListener(
                "input",
                updatePreview
            );
        }


        if (startButton) {

            startButton.addEventListener(
                "click",
                startGame
            );
        }


        if (leaderboardButton) {

            leaderboardButton.addEventListener(
                "click",
                showLeaderboard
            );
        }
    }
);


/* =========================================================
   GLOBAL EXPORTS
========================================================= */

window.startGame =
    startGame;

window.openTopic =
    openTopic;

window.startLevel =
    startLevel;

window.nextQuestion =
    nextQuestion;

window.selectAnswer =
    selectAnswer;

window.useClue =
    useClue;

window.speakQuestion =
    speakQuestion;

window.exitQuiz =
    exitQuiz;

window.goHome =
    goHome;

window.goToTopics =
    goToTopics;

window.continueQuest =
    continueQuest;

window.showLeaderboard =
    showLeaderboard;

window.resetAllProgress =
    resetAllProgress;

/* =========================================================
   V2 UPGRADE
   - Age-band question engine (6-7, 8-9, 10-11, 12-14, 15-17, 18+ interview)
   - No repeated questions (per player age + topic memory)
   - Female, professional voice
   - Global leaderboard (one entry per player, saved when a level is passed)
========================================================= */

const r = randomInt, R = randomChoice;
const gcd = (a, b) => b ? gcd(b, a % b) : a;
const fr = (n, d) => { const g = gcd(n, d); return `${n / g}/${d / g}`; };
const rs = n => "₹" + n;
const band = age => age <= 7 ? 0 : age <= 9 ? 1 : age <= 11 ? 2 : age <= 14 ? 3 : age <= 17 ? 4 : 5;
const num = x => Number(Number(x).toFixed(2));

function mk(q, a, e, h, w) {
    a = String(a);
    let o = w;
    if (!o) {
        const n = +a;
        o = shuffle([n + 1, n - 1, n + 10, n - 10, n + 2, n * 2, n + 5].filter(x => x > 0 && x !== n));
    }
    o = uniqueOptions(o).filter(x => x !== a);
    return makeQuestion(q, [a, ...o.slice(0, 3)], a, e,
        h || "Read the question carefully.", "Solve it step by step.", `Answer: ${a}.`);
}
const fw = (n, d) => [fr(n + 1, d), fr(Math.max(1, n - 1), d), fr(n, d + 1), fr(Math.max(1, d - n), d)];

/* pick a template by difficulty: higher level -> later (harder) templates */
function pick(list, b, l) {
    const f = list.filter(x => x[1] <= b), n = f.length;
    const i = Math.min(n - 1, Math.floor((l - 1) * n / 10 + Math.random() * 1.6));
    return f[i][0](b, l, (b + 1) * (1 + l / 4));
}

/* ---------------- NUMBERS ---------------- */
const NUMBERS = {
    kid: (b, l) => {
        const m = b ? 20 + l * 8 : 6 + l * 2, a = r(2, m), c = r(1, m), t = r(0, b ? 4 : 3);
        if (t === 0) return mk(`What is ${a} + ${c}?`, a + c, `${a} + ${c} = ${a + c}.`, "Start from the bigger number and count up the smaller one.");
        if (t === 1) return mk(`What is ${a + c} − ${c}?`, a, `${a + c} − ${c} = ${a}.`, "Count backwards from the bigger number.");
        if (t === 2) { const s = R([2, 5, 10]); return mk(`Count by ${s}s: ${s}, ${2 * s}, ${3 * s}, ${4 * s}, what comes next?`, 5 * s, `Add ${s} each time.`, "Look at the jump between two neighbouring numbers."); }
        if (t === 3) { const e = r(1, m) * 2; return mk("Which of these is an even number?", e, `${e} can be shared equally between 2.`, "Even numbers end in 0, 2, 4, 6 or 8.", [e + 1, e + 3, e - 1]); }
        const x = r(2, 5 + Math.ceil(l / 2)), y = r(2, 5 + Math.ceil(l / 2));
        return mk(`What is ${x} × ${y}?`, x * y, `${x} groups of ${y} = ${x * y}.`, "Multiplication is repeated addition: how many groups, and how many in each?");
    },
    list: [
        [(b, l, s) => { const a = r(6, 9 + b * 3), c = r(6, 12 + b * 4); const big = Math.max(a, c), small = Math.min(a, c), t = big - big % 10, o = big % 10; const hint = (t > 0 && o > 0) ? "Break the bigger number into tens and ones, multiply each part by the smaller number, then add." : "Use the times table of the smaller number."; return mk(`What is ${a} × ${c}?`, a * c, `${a} × ${c} = ${a * c}.`, hint); }, 2],
        [(b, l, s) => { const c = r(3, 12), q = r(4, Math.round(10 * s)); return mk(`What is ${c * q} ÷ ${c}?`, q, `${c} × ${q} = ${c * q}.`, "Think of the matching multiplication fact: divisor × ? = total."); }, 2],
        [() => { const p = R([[4, 6], [6, 8], [9, 12], [12, 18], [15, 20], [8, 12]]); const k = r(1, 3); const a = p[0] * k, c = p[1] * k; return mk(`Find the LCM of ${a} and ${c}.`, a * c / gcd(a, c), `LCM = (${a} × ${c}) ÷ HCF = ${a * c / gcd(a, c)}.`, "List multiples of the bigger number until the smaller number divides one of them exactly."); }, 2],
        [() => { const p = R([[12, 18], [24, 36], [16, 40], [30, 45], [48, 72], [28, 42]]); return mk(`Find the HCF of ${p[0]} and ${p[1]}.`, gcd(p[0], p[1]), `The greatest common factor of ${p[0]} and ${p[1]} is ${gcd(p[0], p[1])}.`, "List the factors of both numbers and look for the biggest one they share."); }, 2],
        [() => { const d = r(5, 9), q = r(6, 40), rem = r(1, d - 1); return mk(`What is the remainder when ${d * q + rem} is divided by ${d}?`, rem, `${d * q + rem} = ${d} × ${q} + ${rem}.`, "Find the biggest multiple of the divisor that fits inside the number. What is left over?"); }, 3],
        [() => { const n = r(10, 60); return mk(`What is the sum of the first ${n} natural numbers?`, n * (n + 1) / 2, `n(n+1)/2 = ${n}×${n + 1}/2 = ${n * (n + 1) / 2}.`, "Pair the first and last numbers: every pair has the same sum. Or recall n(n+1)/2."); }, 3],
        [() => { const n = r(7, 30); return mk(`What is the value of √${n * n}?`, n, `${n} × ${n} = ${n * n}.`, "Use the last digit and the nearest tens to narrow down the choices."); }, 3],
        [() => { const p = R([[36, 9], [48, 10], [60, 12], [72, 12], [100, 9], [64, 7]]); return mk(`How many factors does ${p[0]} have?`, p[1], `${p[0]} has exactly ${p[1]} factors.`, "Break it into prime factors, then add 1 to each power and multiply."); }, 3],
        [() => { const d = R([6, 7, 8, 9, 11, 13]); const n = 999 - 999 % d; return mk(`What is the greatest 3-digit number divisible by ${d}?`, n, `999 − (999 mod ${d}) = ${n}.`, "Divide 999 by the number. How far is 999 above the nearest multiple?"); }, 4],
        [() => { const b2 = R([2, 3, 7, 8, 9]), e = r(10, 60), cyc = { 2: [2, 4, 8, 6], 3: [3, 9, 7, 1], 7: [7, 9, 3, 1], 8: [8, 4, 2, 6], 9: [9, 1] }[b2]; return mk(`What is the unit digit of ${b2}^${e}?`, cyc[(e - 1) % cyc.length], `Unit digits repeat in a cycle of ${cyc.length}.`, "Unit digits repeat in a cycle. Find the cycle, then see where the power lands in it."); }, 4],
        [() => { const n = R([25, 50, 75, 100, 125, 150]); return mk(`How many trailing zeros does ${n}! have?`, Math.floor(n / 5) + Math.floor(n / 25) + Math.floor(n / 125), "Count the factors of 5: ⌊n/5⌋ + ⌊n/25⌋ + ⌊n/125⌋.", "Zeros come from pairs of 2 and 5, and 5s are rarer. Count the 5s."); }, 5]
    ]
};

/* ---------------- PERCENTAGE ---------------- */
const PERCENTAGE = {
    kid: (b, l) => {
        const n = r(2, 10 + l * (b + 1));
        const t = r(0, 2);
        if (t === 0) return mk(`What is half of ${2 * n}?`, n, `${2 * n} ÷ 2 = ${n}.`, "Split into 2 equal parts.");
        if (t === 1) return mk(`What is double ${n}?`, 2 * n, `${n} + ${n} = ${2 * n}.`, "Add the number to itself.");
        return mk(`A pizza has ${2 * n} slices. You eat half. How many slices are left?`, n, `Half of ${2 * n} is ${n}.`, "Eating half means the other half is left.");
    },
    list: [
        [() => { const n = 20 * r(2, 15), p = R([10, 20, 25, 50]); const ph = { 10: "10% means divide by 10.", 20: "20% means one-fifth. Divide by 5.", 25: "25% means one-quarter. Divide by 4.", 50: "50% means half. Divide by 2." }[p]; return mk(`What is ${p}% of ${n}?`, n * p / 100, `${p}% of ${n} = ${n * p / 100}.`, ph); }, 2],
        [() => { const n = 20 * r(2, 25), p = R([10, 20, 25, 50]); return mk(`A number ${n} is increased by ${p}%. What is the new number?`, n * (100 + p) / 100, `${n} × ${100 + p}/100 = ${n * (100 + p) / 100}.`, "Find the increase first, then add it to the original number."); }, 2],
        [() => { const n = 20 * r(3, 40), p = R([10, 20, 25, 30]); return mk(`A shirt costs ${rs(n)}. A ${p}% discount is given. What is the price now?`, rs(n * (100 - p) / 100), `${100 - p}% of ${n} = ${n * (100 - p) / 100}.`, "You pay (100 − discount)% of the price. Find that part."); }, 2],
        [() => { const bb = 20 * r(2, 12), p = R([10, 25, 40, 50, 75]); return mk(`What percent of ${bb} is ${bb * p / 100}?`, p + "%", `${bb * p / 100}/${bb} × 100 = ${p}%.`, "Part ÷ whole × 100."); }, 3],
        [() => { const o = 20 * r(5, 40), p = R([10, 20, 25, 50]); const v = o * (100 + p) / 100; return mk(`After a ${p}% increase, a value becomes ${v}. What was the original value?`, o, `Original = ${v} × 100/${100 + p} = ${o}.`, `Treat the original as 100%. The new value is ${100 + p}% of it. Work backwards.`); }, 4],
        [() => { const x = R([10, 20, 25, 50]), y = R([10, 20, 25]); const net = num(x - y - x * y / 100); const a = net >= 0 ? `${net}% increase` : `${-net}% decrease`; return mk(`A value is increased by ${x}% and then decreased by ${y}%. What is the net change?`, a, `Take 100: 100 × ${100 + x}/100 × ${100 - y}/100 = ${num(100 + net)}.`, "Assume the value is 100 and apply the two changes one after the other.", [`${Math.abs(num(x - y))}% ${x >= y ? "increase" : "decrease"}`, "No change", `${num(Math.abs(net) + 5)}% ${net >= 0 ? "decrease" : "increase"}`, `${num(Math.abs(net) + 2)}% ${net >= 0 ? "increase" : "decrease"}`]); }, 4],
        [() => { const p = R([[25, 20], [100, 50], [150, 60], [300, 75]]); return mk(`A's salary is ${p[0]}% more than B's. B's salary is what percent less than A's?`, p[1] + "%", `Take B = 100, A = ${100 + p[0]}. Difference ÷ A = ${p[1]}%.`, "Assume B = 100 and find A. Then compare the difference with A, not B.", [p[0] + "%", (p[1] + 5) + "%", (p[1] - 5) + "%"]); }, 5],
        [() => { const n = 25 * r(2, 40) * 100 / 25, p = R([10, 20]); return mk(`A town's population of ${n} grows by ${p}% every year. What will it be after 2 years?`, num(n * (1 + p / 100) ** 2), `${n} × ${1 + p / 100} × ${1 + p / 100}.`, "Apply the growth one year at a time."); }, 5]
    ]
};

/* ---------------- PROFIT & LOSS ---------------- */
const PROFITLOSS = {
    kid: (b, l) => {
        const a = r(10, 30 + l * 5 * (b + 1)), c = r(2, a - 1), k = r(2, 5), t = r(0, 2);
        if (t === 0) return mk(`Riya has ${rs(a)}. She buys a pencil for ${rs(c)}. How much money is left?`, rs(a - c), `${a} − ${c} = ${a - c}.`, "Subtract what was spent from what she had.");
        if (t === 1) return mk(`One eraser costs ${rs(c)}. How much do ${k} erasers cost?`, rs(c * k), `${c} × ${k} = ${c * k}.`, "Same price for each item: think multiplication.");
        return mk(`Arjun pays ${rs(a + c)} for a toy that costs ${rs(a)}. How much change should he get back?`, rs(c), `${a + c} − ${a} = ${c}.`, "Change = money paid − cost.");
    },
    list: [
        [() => { const cp = 20 * r(5, 40), p = R([10, 20, 25, 50]); return mk(`An article costing ${rs(cp)} is sold at ${p}% profit. Find the selling price.`, rs(cp * (100 + p) / 100), `SP = ${cp} × ${100 + p}/100 = ${cp * (100 + p) / 100}.`, "Profit is calculated on the cost price. Find the profit amount, then add it to the cost price."); }, 2],
        [() => { const cp = 20 * r(5, 40), p = R([10, 15, 20, 25]); const sp = cp * (100 + p) / 100; return mk(`An article bought for ${rs(cp)} is sold for ${rs(sp)}. What is the profit percent?`, p + "%", `Profit = ${sp - cp}. (${sp - cp}/${cp}) × 100 = ${p}%.`, "Find the profit amount first, then compare it with the cost price."); }, 2],
        [() => { const cp = 20 * r(5, 50), l2 = R([10, 20, 25]); return mk(`A trader sells an article costing ${rs(cp)} at a ${l2}% loss. Find the selling price.`, rs(cp * (100 - l2) / 100), `SP = ${cp} × ${100 - l2}/100.`, "Find the loss amount, then subtract it from the cost price."); }, 2],
        [() => { const sp = 20 * r(5, 40), p = R([10, 20, 25]); const cp = sp; return mk(`By selling an article for ${rs(sp * (100 + p) / 100)}, a shopkeeper earns ${p}% profit. What was the cost price?`, rs(cp), `CP = SP × 100/${100 + p} = ${cp}.`, "The selling price is (100 + profit)% of the cost price. Work backwards."); }, 3],
        [() => { const d = R([[10, 20], [20, 30], [25, 40]]); const x = R([10, 20, 25]), y = R([10, 20, 30]); const net = num(x + y - x * y / 100); return mk(`Two successive discounts of ${x}% and ${y}% are equal to a single discount of?`, net + "%", `${x} + ${y} − (${x}×${y})/100 = ${net}%.`, "Assume the price is 100 and apply the discounts one after the other.", [(x + y) + "%", num(net + 2) + "%", num(net - 2) + "%"]); }, 3],
        [() => { const c = R([[80, 25, 20], [60, 20, 10]]); const k = r(2, 12); const cp = c[0] * k; const mp = cp * (100 + c[1]) / (100 - c[2]); return mk(`A trader wants ${c[1]}% profit after giving a ${c[2]}% discount. The cost price is ${rs(cp)}. What should the marked price be?`, rs(mp), `Required SP = ${cp * (100 + c[1]) / 100}. MP = SP ÷ ${(100 - c[2]) / 100} = ${mp}.`, "Find the required SP first, then reverse the discount."); }, 4],
        [() => { const c = R([[20, 10], [25, 20], [50, 20], [40, 25], [30, 10]]); const net = num((100 + c[0]) * (100 - c[1]) / 100 - 100); const a = net >= 0 ? `${net}% profit` : `${-net}% loss`; return mk(`A shopkeeper marks goods ${c[0]}% above cost and gives a ${c[1]}% discount. What is the profit or loss percent?`, a, `Take CP = 100. MP = ${100 + c[0]}. SP = ${num((100 + c[0]) * (100 - c[1]) / 100)}.`, "Assume CP = 100. Find the marked price, then the selling price after the discount.", [`${num(Math.abs(net) + 2)}% profit`, `${num(Math.abs(net) + 3)}% loss`, "No profit no loss"]); }, 4],
        [() => { const x = R([10, 20, 25]); const v = num(x * x / 100); return mk(`Two articles are sold at the same price. One at ${x}% profit and the other at ${x}% loss. What is the overall result?`, `${v}% loss`, `When SP is equal and gain% = loss%, there is always a loss of x²/100 = ${v}%.`, "Compare the cost prices of the two articles. Which one cost more? The shortcut x²/100 gives the size of the change.", [`${v}% profit`, "No profit no loss", `${num(v * 2)}% loss`]); }, 5],
        [() => { const w = R([[900, 11.11], [800, 25], [750, 33.33], [950, 5.26]]); return mk(`A dishonest shopkeeper sells at cost price but uses a ${w[0]} g weight for 1 kg. What is his gain percent?`, w[1] + "%", `Gain = (1000 − ${w[0]})/${w[0]} × 100 ≈ ${w[1]}%.`, "Gain is divided by the weight actually given.", [num(w[1] + 3) + "%", num(w[1] - 3) + "%", (1000 - w[0]) / 10 + "%"]); }, 5]
    ]
};

/* ---------------- TIME & WORK ---------------- */
const TIMEWORK = {
    kid: (b, l) => {
        const p = r(2, 4 + l), d = r(2, 5 + Math.ceil(l / 2));
        if (b === 0 || r(0, 1)) return mk(`Meena reads ${p} pages every day. How many pages does she read in ${d} days?`, p * d, `${p} × ${d} = ${p * d}.`, "Same amount each day: think multiplication.");
        const s = r(1, 9), h = r(1, 3);
        return mk(`A class starts at ${s} o'clock and lasts ${h} hours. At what time does it end?`, `${s + h} o'clock`, `${s} + ${h} = ${s + h}.`, "Add the duration to the start time.", [`${s + h + 1} o'clock`, `${s + h - 1 || 12} o'clock`, `${s + h + 2} o'clock`]);
    },
    list: [
        [() => { const d = r(5, 30); return mk(`A can finish a job in ${d} days. What part of the job does A finish in 1 day?`, `1/${d}`, `One day's work = 1/${d}.`, "Whole job = 1. One day's work = whole job ÷ number of days.", [`1/${d + 1}`, `2/${d}`, `1/${d - 1}`]); }, 2],
        [() => { const p = R([[10, 15, 6], [12, 24, 8], [20, 30, 12], [15, 30, 10], [6, 12, 4], [30, 45, 18], [12, 18, 7.2]]); return mk(`A can do a work in ${p[0]} days and B in ${p[1]} days. In how many days will they finish it together?`, p[2] + " days", `1/${p[0]} + 1/${p[1]} → together they take ${p[2]} days.`, "Add their one-day work, then take the reciprocal.", [num(p[2] + 2) + " days", num(p[2] + 4) + " days", num(p[2] - 1) + " days"]); }, 2],
        [() => { const t = R([6, 8, 10, 12, 18, 20]), k = R([2, 3]); return mk(`A is ${k} times as efficient as B. If B alone takes ${t * k} days, how many days does A take?`, t + " days", `A takes 1/${k} of B's time: ${t * k}/${k} = ${t}.`, "More efficient means less time. Divide B's time by the efficiency factor.", [t * k + " days", (t + k) + " days", (t * k * 2) + " days"]); }, 3],
        [() => { const m = r(3, 8), k = R([2, 3]), d = k * r(2, 5); return mk(`${m} men can complete a work in ${d} days. How many days will ${m * k} men take?`, d / k + " days", `Man-days = ${m} × ${d}. Days = ${m * d}/${m * k} = ${d / k}.`, "Work = men × days stays the same.", [d * k + " days", d + " days", (d / k + 2) + " days"]); }, 3],
        [() => { const p = R([[10, 15], [12, 18], [20, 30], [6, 9], [15, 20], [8, 12]]); const t = p[0] * p[1] / (p[1] - p[0]); return mk(`A pipe fills a tank in ${p[0]} hours and another pipe empties it in ${p[1]} hours. If both are open, how long to fill the tank?`, t + " hours", `Net rate = 1/${p[0]} − 1/${p[1]}. Time = ${t} hours.`, "Subtract the emptying rate from the filling rate.", [(p[0] + p[1]) + " hours", num(t / 2) + " hours", num(t + 10) + " hours"]); }, 4],
        [() => { const p = R([[12, 18, 4], [20, 30, 5], [30, 45, 6], [10, 15, 2]]); const rem = 1 - p[2] / p[0], rate = 1 / p[0] + 1 / p[1]; const t = num(rem / rate); return mk(`A can finish a job in ${p[0]} days and B in ${p[1]} days. A works alone for ${p[2]} days, then B joins. How many more days to finish?`, t + " days", `A does ${p[2]}/${p[0]}. Remaining ${num(rem)} ÷ combined rate = ${t} days.`, "Find how much A finishes alone first, then see what is left for both.", [num(t + 1) + " days", num(t - 1) + " days", num(t + 2.5) + " days"]); }, 5]
    ]
};

/* ---------------- SPEED & DISTANCE ---------------- */
const SPEED = {
    kid: (b, l) => {
        const s = r(2, 5 + l), t = r(2, 5);
        return b === 0 || r(0, 1)
            ? mk(`A boy walks ${s} km every day. How far does he walk in ${t} days?`, `${s * t} km`, `${s} × ${t} = ${s * t}.`, "Same distance each day: think multiplication.")
            : mk(`A bus goes ${s * 10} km in 1 hour. How far will it go in ${t} hours?`, `${s * 10 * t} km`, `${s * 10} × ${t} = ${s * 10 * t}.`, "Distance = speed × time.", [`${s * 10 * t + 10} km`, `${s * 10 * t - 10} km`, `${s * 10 + t} km`]);
    },
    list: [
        [() => { const s = r(20, 90), t = r(2, 6); return mk(`A car moves at ${s} km/h for ${t} hours. How far does it travel?`, `${s * t} km`, `Distance = ${s} × ${t}.`, "Distance = speed × time.", [`${s * t + 10} km`, `${s * t - 10} km`, `${s + t} km`]); }, 2],
        [() => { const t = r(2, 6), s = r(3, 20) * 5, d = s * t; return mk(`A train covers ${d} km in ${t} hours. What is its speed?`, `${s} km/h`, `${d} ÷ ${t} = ${s}.`, "Speed = distance ÷ time.", [`${s + 10} km/h`, `${s - 5} km/h`, `${s + 20} km/h`]); }, 2],
        [() => { const k = r(2, 8); return mk(`Convert ${18 * k} km/h into m/s.`, `${5 * k} m/s`, `Multiply by 5/18: ${18 * k} × 5/18 = ${5 * k}.`, "km/h to m/s: multiply by 5/18.", [`${18 * k} m/s`, `${5 * k + 2} m/s`, `${10 * k} m/s`]); }, 3],
        [() => { const p = R([[30, 60, 40], [40, 60, 48], [20, 30, 24], [60, 90, 72], [40, 120, 60]]); return mk(`A person goes from A to B at ${p[0]} km/h and returns at ${p[1]} km/h. What is the average speed for the whole trip?`, `${p[2]} km/h`, `2ab/(a+b) = 2×${p[0]}×${p[1]}/${p[0] + p[1]} = ${p[2]}.`, "The distance is the same both ways, so don't just average the speeds. Try 2ab ÷ (a + b).", [`${(p[0] + p[1]) / 2} km/h`, `${p[2] + 4} km/h`, `${p[2] - 4} km/h`]); }, 3],
        [() => { const a = r(30, 70), c = r(20, 60), t = r(2, 5); return mk(`Two cars start ${(a + c) * t} km apart and move towards each other at ${a} km/h and ${c} km/h. When will they meet?`, `${t} hours`, `Relative speed = ${a + c}. Time = ${(a + c) * t}/${a + c} = ${t}.`, "Moving towards each other means their speeds add. Then time = distance ÷ speed.", [`${t + 1} hours`, `${t + 2} hours`, `${Math.max(1, t - 1)} hours`]); }, 3],
        [() => { const v = r(8, 30), L = r(80, 200), t0 = Math.ceil((L + 20) / v), t = r(t0, t0 + 8); const P = v * t - L; return mk(`A train ${L} m long crosses a platform ${P} m long in ${t} seconds. What is its speed?`, `${v} m/s`, `Total distance = ${L} + ${P} = ${v * t}. Speed = ${v * t}/${t}.`, "Distance covered = train + platform.", [`${v + 3} m/s`, `${v - 2} m/s`, `${v + 6} m/s`]); }, 4],
        [() => { const bb = r(8, 20), s = r(2, 6); return mk(`A boat goes ${bb + s} km/h downstream and ${bb - s} km/h upstream. What is the speed of the stream?`, `${s} km/h`, `Stream = (down − up)/2 = ${s}.`, "Stream speed = half the difference.", [`${bb} km/h`, `${s + 2} km/h`, `${bb - s} km/h`]); }, 4],
        [() => { const k = r(2, 6), T = r(6, 15); const sv = 18 * k, tot = 5 * k * T; return mk(`Two trains of total length ${tot} m run in opposite directions at a combined speed of ${sv} km/h. How long do they take to cross each other completely?`, `${T} seconds`, `${sv} km/h = ${5 * k} m/s. Time = ${tot}/${5 * k} = ${T}.`, "Convert to m/s and add the lengths.", [`${T + 2} seconds`, `${T * 2} seconds`, `${T - 1} seconds`]); }, 5]
    ]
};

/* ---------------- RATIO ---------------- */
const RATIO = {
    kid: (b, l) => {
        const c = r(2, 4 + l), k = r(2, 5);
        return mk(`Each child gets ${k} sweets. There are ${c} children. How many sweets are needed?`, k * c, `${k} × ${c} = ${k * c}.`, "Same number for each child: think multiplication.");
    },
    list: [
        [() => { const a = r(2, 8), bb = r(3, 10), m = r(2, 12); return mk(`A : B = ${a} : ${bb}. If A = ${a * m}, what is B?`, bb * m, `One part = ${m}. B = ${bb} × ${m}.`, "Find the value of one part first."); }, 2],
        [() => { const p = R([[2, 3], [3, 4], [2, 5], [4, 5], [3, 7]]); const t = (p[0] + p[1]) * r(20, 90); return mk(`Divide ${rs(t)} in the ratio ${p[0]} : ${p[1]}. What is the larger share?`, rs(t / (p[0] + p[1]) * p[1]), `One part = ${t / (p[0] + p[1])}. Larger = ${p[1]} parts.`, "Add the ratio parts to get the total parts, find one part, then pick the larger share."); }, 2],
        [() => { const x = r(3, 9), y = r(x + 1, x + 6), k = r(5, 25); return mk(`Two numbers are in the ratio ${x} : ${y} and their sum is ${(x + y) * k}. Find the larger number.`, y * k, `One part = ${k}. Larger = ${y} × ${k}.`, "Add the ratio parts, find 1 part from the sum, then pick the larger number."); }, 3],
        [() => { const a = R([2, 3, 4, 5]), bb = R([3, 4, 5, 7]), c = R([2, 5, 9, 4]), d = R([3, 7, 8]); const n = a * c, m = bb * d, g = gcd(n, m); return mk(`If A : B = ${a} : ${bb} and B : C = ${c} : ${d}, find A : C.`, `${n / g} : ${m / g}`, `A:C = (${a}×${c}) : (${bb}×${d}) = ${n} : ${m}.`, "Multiply the first terms and the last terms.", [`${m / g} : ${n / g}`, `${a} : ${d}`, `${n / g + 1} : ${m / g}`]); }, 4],
        [() => { const m = r(2, 6) * 3, w = m / 3 * 2; return mk(`A mixture of milk and water is in the ratio 3 : 2 and its volume is ${m + w} litres. How much water must be added to make the ratio 3 : 4?`, `${(m / 3 * 2)} litres`, `Milk = ${m}. For 3:4, water = ${m / 3 * 4}. Add ${m / 3 * 4} − ${w} = ${m / 3 * 2}.`, "The quantity of milk doesn't change. Find it first, then work out the water needed for the new ratio.", [`${m / 3} litres`, `${m} litres`, `${m / 3 * 4} litres`]); }, 5],
        [() => { const p = R([[3, 5], [4, 7], [5, 6]]); const k = r(2, 6); const s = k * (p[0] + p[1]) + 2 * (p[0] + p[1]) + 0; return mk(`The ages of two brothers are in the ratio ${p[0]} : ${p[1]}. The sum of their ages is ${k * (p[0] + p[1])}. What is the age of the elder brother?`, p[1] * k, `One part = ${k}. Elder = ${p[1]} × ${k}.`, "Add the ratio parts, find 1 part from the total, then pick the elder's share."); }, 4]
    ]
};

/* ---------------- PROBABILITY ---------------- */
const PROBABILITY = {
    kid: (b, l) => {
        const x = r(1, 6), y = r(7, 12);
        if (b === 0 || r(0, 1)) return mk(`A bag has ${x} red balls and ${y} blue balls. Which colour are you more likely to pick?`, "Blue", `There are more blue balls (${y}) than red (${x}).`, "The colour with more balls is more likely.", ["Red", "Both equally", "Green"]);
        return mk(`A die is rolled once. How many possible outcomes are there?`, 6, "A die has faces 1 to 6.", "Think of a normal die. How many faces does it have? Each face is one outcome.", [4, 8, 12]);
    },
    list: [
        [() => { const k = r(1, 5); return mk(`A die is rolled. What is the probability of getting a number greater than ${k}?`, fr(6 - k, 6), `Favourable outcomes = ${6 - k} out of 6.`, "Count the favourable numbers on the die, then divide by 6.", fw(6 - k, 6)); }, 2],
        [() => { const R1 = r(2, 9), B = r(2, 9), G = r(1, 6), T = R1 + B + G; return mk(`A bag has ${R1} red, ${B} blue and ${G} green balls. One ball is drawn at random. What is the probability that it is NOT green?`, fr(T - G, T), `Not green = ${T - G} of ${T}.`, "Count the balls that are not green, or use 1 − P(green).", fw(T - G, T)); }, 2],
        [() => { const c = R([["a king", 4], ["a heart", 13], ["a red card", 26], ["a face card", 12], ["the ace of spades", 1], ["a spade or a heart", 26]]); return mk(`One card is drawn from a well-shuffled pack of 52. What is the probability of getting ${c[0]}?`, fr(c[1], 52), `${c[1]} favourable cards out of 52.`, "A pack has 52 cards. Count the favourable ones first.", fw(c[1], 52)); }, 3],
        [() => { const c = R([["exactly one head", 2], ["at least one head", 3], ["two heads", 1], ["no head", 1]]); return mk(`Two fair coins are tossed. What is the probability of getting ${c[0]}?`, fr(c[1], 4), `Outcomes: HH, HT, TH, TT. Favourable = ${c[1]}.`, "List all the possible outcomes first, then count the favourable ones.", fw(c[1], 4)); }, 3],
        [() => { const s = r(3, 11), w = 6 - Math.abs(s - 7); return mk(`Two dice are rolled. What is the probability that the sum is ${s}?`, fr(w, 36), `${w} pairs out of 36 give a sum of ${s}.`, "List the pairs that give this sum. Total outcomes = 36.", fw(w, 36)); }, 4],
        [() => { const c = R([["at least two heads", 4], ["exactly two heads", 3], ["all the same", 2], ["exactly one tail", 3]]); return mk(`Three fair coins are tossed. What is the probability of getting ${c[0]}?`, fr(c[1], 8), `Favourable = ${c[1]} of 8.`, "Three coins have 8 outcomes in all. List them and count the favourable ones.", fw(c[1], 8)); }, 4],
        [() => { const Rd = r(3, 7), T = Rd + r(2, 6); return mk(`A bag has ${Rd} red and ${T - Rd} blue balls. Two balls are drawn one after another without replacement. What is the probability that both are red?`, fr(Rd * (Rd - 1), T * (T - 1)), `(${Rd}/${T}) × (${Rd - 1}/${T - 1}).`, "After the first red is drawn, both the red count and the total go down by one.", fw(Rd * (Rd - 1), T * (T - 1))); }, 5]
    ]
};

/* ---------------- AVERAGES ---------------- */
const AVERAGE = {
    kid: (b, l) => {
        if (b === 0) { const m = r(2, 5 + l), d = r(1, m - 1); return mk(`What is the average of ${m - d} and ${m + d}?`, m, `(${m - d} + ${m + d}) ÷ 2 = ${m}.`, "Add both numbers and divide by 2."); }
        const m = r(4, 10 + l); return mk(`Find the average of ${m - 2}, ${m} and ${m + 2}.`, m, `Sum = ${3 * m}. ${3 * m} ÷ 3 = ${m}.`, "Add all and divide by how many numbers.");
    },
    list: [
        [() => { const n = r(4, 6), m = r(12, 40); let xs, last; do { xs = []; let s = 0; for (let i = 0; i < n - 1; i++) { const v = m + r(-8, 8); xs.push(v); s += v; } last = m * n - s; } while (last < 1); xs.push(last); return mk(`Find the average of ${xs.join(", ")}.`, m, `Sum = ${m * n}. ${m * n} ÷ ${n} = ${m}.`, "Average = sum ÷ count."); }, 2],
        [() => { const n = r(5, 12), a = r(10, 60); return mk(`The average of ${n} numbers is ${a}. What is their total?`, n * a, `${a} × ${n} = ${n * a}.`, "Total = average × count."); }, 2],
        [() => { const n = R([5, 7, 9, 11, 15]); const t = R([["first n odd numbers", n], ["first n natural numbers", (n + 1) / 2], ["first n even numbers", n + 1]]); return mk(`What is the average of the ${t[0].replace("n", n)}?`, t[1], `Use the standard formula for the ${t[0]}.`, "Try a small value like n = 3 and look for the pattern."); }, 3],
        [() => { const n = r(5, 12), a = r(20, 45), k = r(1, 4); return mk(`The average of ${n} students' marks is ${a}. When a new student joins, the average becomes ${a + k}. What did the new student score?`, a + k * (n + 1), `New total − old total = ${(a + k) * (n + 1)} − ${a * n}.`, "Find the total before and after. The difference is the new student's score."); }, 3],
        [() => { const a = r(20, 40), m = a + r(1, 4); return mk(`The average of 5 numbers is ${a}. When one number ${5 * a - 4 * m} is removed, what is the average of the remaining 4?`, m, `Remaining sum = ${5 * a} − ${5 * a - 4 * m} = ${4 * m}. Average = ${m}.`, "Find the total of all 5 first, then take away the removed number."); }, 3],
        [() => { let a1, a2; do { a1 = r(30, 80); a2 = r(30, 80); } while ((2 * a1 + 3 * a2) % 5); const t = (2 * a1 + 3 * a2) / 5; return mk(`Section A has 20 students with an average of ${a1}. Section B has 30 students with an average of ${a2}. What is the combined average?`, t, `(20×${a1} + 30×${a2}) ÷ 50 = ${t}.`, "Find each section's total marks, add them, then divide by all the students.", [num((a1 + a2) / 2), t + 2, t - 2]); }, 4],
        [() => { const n = r(8, 14), a = r(30, 50), k = r(1, 3); return mk(`A batsman's average after ${n} innings is ${a}. How many runs must he score in the next innings to raise the average by ${k}?`, a + k * (n + 1), `Required = ${a} + ${k} × ${n + 1}.`, "Find the total needed for the new average, then subtract the runs scored so far."); }, 5]
    ]
};

/* ---------------- LOGICAL REASONING ---------------- */
const shiftWord = (w, k) => w.split("").map(c => String.fromCharCode((c.charCodeAt(0) - 65 + k) % 26 + 65)).join("");
const LOGICAL = {
    kid: (b, l) => {
        const t = r(0, 2);
        if (t === 0) { const a = R(["🔴", "🟢", "🔵", "🟡"]), c = R(["⭐", "🌙", "☀️"]); return mk(`What comes next? ${a} ${c} ${a} ${c} ${a} ?`, c, "The two shapes take turns.", "Look at the two shapes. They repeat in the same order. Which one comes after the last shape?", [a, "⬛", "🔺"]); }
        if (t === 1) { const s = r(1, 5), d = r(1, b ? 5 : 3), x = [0, 1, 2, 3].map(i => s + i * d); return mk(`Find the next number: ${x.join(", ")}, ?`, s + 4 * d, `Add ${d} each time.`, "How much does it go up each time?"); }
        const z = R([["Dog", "Cat", "Cow", "Car"], ["Apple", "Mango", "Banana", "Chair"], ["Red", "Blue", "Green", "Table"], ["Pen", "Pencil", "Eraser", "Shoe"]]);
        return mk(`Which one is the odd one out? ${shuffle(z).join(", ")}`, z[3], `${z[3]} does not belong with the others.`, `Three of these are ${{ Dog: "animals", Apple: "fruits", Red: "colours", Pen: "stationery items" }[z[0]]}. Which one is not?`, z.slice(0, 3));
    },
    list: [
        [() => { const s = r(2, 30), d = r(2, 9), x = [0, 1, 2, 3, 4].map(i => s + i * d); return mk(`Find the next number: ${x.join(", ")}, ?`, s + 5 * d, `Add ${d} each time.`, "Find the difference between neighbouring numbers. Is it always the same?"); }, 2],
        [() => { const s = r(2, 6), m = R([2, 3]), x = [0, 1, 2, 3].map(i => s * m ** i); return mk(`Find the next number: ${x.join(", ")}, ?`, s * m ** 4, `Multiply by ${m} each time.`, "Divide each term by the one before it. Is the multiplier always the same?"); }, 2],
        [() => { const w = R(["CAT", "DOG", "PEN", "SUN", "BOOK", "TREE", "MILK"]), k = r(1, 3), w2 = R(["RAIN", "FISH", "LAMP", "SHIP"]); return mk(`If ${w} is coded as ${shiftWord(w, k)}, how is ${w2} coded?`, shiftWord(w2, k), `Each letter moves ${k} step(s) forward.`, "See how far the first letter moved, then do the same for every letter.", [shiftWord(w2, k + 1), shiftWord(w2, k - 1 + 26), shiftWord(w2, k + 2)]); }, 3],
        [() => { const d = R([3, 4, 5, 6, 7, 9]), a = [1, 2, 3, 4, 5, 6, 7].map(i => d * i); const three = shuffle(a).slice(0, 3); const odd = d * r(8, 12) + r(1, d - 1); return mk(`Find the odd one out: ${shuffle([...three, odd]).join(", ")}`, odd, `The others are multiples of ${d}.`, `Check which number is not a multiple of ${d}.`, three.map(String)); }, 3],
        [() => { const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], i = r(0, 6), n = r(10, 200); return mk(`Today is ${days[i]}. What day will it be after ${n} days?`, days[(i + n) % 7], `${n} mod 7 = ${n % 7}. Move ${n % 7} day(s) ahead.`, "Days repeat every 7. Divide by 7 and look at the remainder.", shuffle(days.filter(x => x !== days[(i + n) % 7])).slice(0, 3)); }, 3],
        [() => { const k = r(1, 6); return mk(`A man walks ${3 * k} km north, then ${4 * k} km east. How far is he from the starting point?`, `${5 * k} km`, `Distance = √((${3 * k})² + (${4 * k})²) = ${5 * k} km.`, "North and east form a right angle. Think Pythagoras.", [`${7 * k} km`, `${5 * k + 1} km`, `${6 * k} km`]); }, 3],
        [() => { const p = r(3, 15), q = r(3, 15); return mk(`In a row, Kiran is ${p}th from the left and ${q}th from the right. How many people are in the row?`, p + q - 1, `Total = ${p} + ${q} − 1.`, "Kiran is counted in both numbers. Don't count him twice."); }, 3],
        [() => { const h = R([2, 3, 4, 5, 7, 8, 9, 10]); const a = Math.min(30 * h, 360 - 30 * h); return mk(`What is the angle between the hour hand and the minute hand at ${h}:00?`, a + "°", `Each hour = 30°. Angle = ${a}°.`, "Each hour mark is 30° apart. Count the marks between the two hands.", [(a + 30) + "°", (a - 30) + "°", (a + 60) + "°"]); }, 4],
        [() => { const s = r(2, 10), t = r(3, 12); const x = [s, t, s + 2, t + 3, s + 4, t + 6, s + 6]; return mk(`Find the next number: ${x.join(", ")}, ?`, t + 9, `Two series: ${s}, ${s + 2}, ... and ${t}, ${t + 3}, ${t + 6}, ${t + 9}.`, "Two series are mixed together. Look at alternate terms separately.", [t + 8, s + 8, t + 7]); }, 4],
        [() => { const q = R([["Pointing to a photograph, Ravi says, “She is the daughter of my father's only son.” Who is she to Ravi?", "Daughter", ["Sister", "Niece", "Mother"], "Start with \"my father's only son\". Who could that be?"], ["A is the brother of B, B is the sister of C, and C is the father of D. How is A related to D?", "Uncle", ["Father", "Cousin", "Grandfather"], "A, B and C are siblings. D is C's child. How is A related to a sibling's child?"], ["A is B's sister. C is B's mother. D is C's father. How is A related to D?", "Granddaughter", ["Daughter", "Niece", "Grandmother"], "Find D's relation to A first, then reverse it."]]); return mk(q[0], q[1], "Draw the family tree step by step.", q[3], q[2]); }, 4],
        [() => { const q = R([["Statements: All pens are books. All books are tables. Conclusion: All pens are tables.", "Definitely true", "Chain the statements together. Do they link pens to tables?"], ["Statements: Some doctors are teachers. All teachers are honest. Conclusion: Some doctors are honest.", "Definitely true", "Every teacher is honest. What does that say about the doctors who are teachers?"], ["Statements: All cats are animals. Some animals are wild. Conclusion: Some cats are wild.", "Cannot be determined", "Draw circles for cats, animals and wild. Must the wild animals include cats?"]]); return mk(q[0], q[1], "Draw Venn diagrams for the statements.", q[2], ["Definitely true", "Definitely false", "Cannot be determined", "Partly true"].filter(x => x !== q[1])); }, 5]
    ]
};

const TOPIC_GEN = { numbers: NUMBERS, logical: LOGICAL, percentage: PERCENTAGE, profitloss: PROFITLOSS, timework: TIMEWORK, speed: SPEED, ratio: RATIO, probability: PROBABILITY, average: AVERAGE };

generateQuestion = function (topicId, age, level) {
    const b = band(age), T = TOPIC_GEN[topicId] || NUMBERS;
    return b <= 1 ? T.kid(b, level) : pick(T.list, b, level);
};

/* ---------- NO REPEATED QUESTIONS ---------- */
createQuestionSet = function (topicId, level) {
    const key = `AQ_seen_${currentPlayer.age}_${topicId}`;
    let seen = [];
    try { seen = JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) { }
    const res = []; let tries = 0;
    while (res.length < QUESTIONS_PER_LEVEL && tries < 400) {
        const q = generateQuestion(topicId, currentPlayer.age, level); tries++;
        if (res.some(x => x.question === q.question)) continue;
        if (seen.includes(q.question) && tries < 300) continue;
        res.push(q);
    }
    seen.push(...res.map(x => x.question));
    try { localStorage.setItem(key, JSON.stringify(seen.slice(-600))); } catch (e) { }
    return res;
};

/* ---------- FEMALE PROFESSIONAL VOICE ---------- */
let chosenVoice = null;
function pickVoice() {
    const v = speechSynthesis.getVoices();
    const prefs = [/Neerja/i, /Natural.*(Aria|Jenny|Sonia|Libby|Neerja)/i, /Google UK English Female/i, /Samantha|Karen|Tessa|Moira/i, /Zira|Aria|Jenny|Sonia/i, /Veena|Heera/i, /female/i];
    for (const p of prefs) { const f = v.find(x => /^en/i.test(x.lang) && p.test(x.name)); if (f) return f; }
    return v.find(x => /^en/i.test(x.lang)) || null;
}
if ("speechSynthesis" in window) {
    chosenVoice = pickVoice();
    speechSynthesis.onvoiceschanged = () => { chosenVoice = pickVoice(); };
}
const SAY = {
    "Correct answer!": "Well done. That is correct.",
    "Wrong answer!": "That is not correct. Please review the explanation.",
    "Oops! You failed this level. Please retry.": "You did not clear this level. Please try again."
};
function cleanForSpeech(t) {
    return String(t).replace(/×/g, " times ").replace(/÷/g, " divided by ").replace(/−/g, " minus ")
        .replace(/(\d)\s*-\s*(\d)/g, "$1 minus $2").replace(/\+/g, " plus ").replace(/%/g, " percent ")
        .replace(/₹\s?(\d+)/g, "$1 rupees").replace(/√/g, " square root of ").replace(/km\/h/g, " kilometres per hour")
        .replace(/m\/s/g, " metres per second").replace(/(\d+)\/(\d+)/g, "$1 by $2").replace(/\^/g, " to the power ")
        .replace(/°/g, " degrees").replace(/\s*:\s*(?=\d)/g, " to ").replace(/[🔴🟢🔵🟡⭐🌙☀️⬛🔺]/gu, " ");
}
speakText = function (text) {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(cleanForSpeech(SAY[text] || text));
    if (!chosenVoice) chosenVoice = pickVoice();
    if (chosenVoice) { u.voice = chosenVoice; u.lang = chosenVoice.lang; } else u.lang = "en-IN";
    u.rate = 0.93; u.pitch = 1.05;

    /* Chrome silently drops speak() when it is called in the same
       instant as cancel(); a tiny delay makes it fire reliably. */
    setTimeout(() => {
        speechSynthesis.speak(u);
    }, 60);
};
speakQuestion = function () {
    const q = questions[currentQuestionIndex];
    if (!q) return;
    speakText(q.question + ". " + q.options.map((o, i) => `Option ${String.fromCharCode(65 + i)}. ${o}.`).join(" "));
};
window.speakQuestion = speakQuestion;

/* ---------- GLOBAL LEADERBOARD ---------- */
function getPlayerId() {
    let id = localStorage.getItem("AQ_pid");
    if (!id) { id = "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); localStorage.setItem("AQ_pid", id); }
    return id;
}
const FS_URL = "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/*
   The Firebase setup lives in a deferred <script type="module">, so on a slow
   connection the globals may not exist yet when the player acts. Wait briefly
   instead of declaring Firebase unavailable.
*/
function waitForFirebase(timeoutMs) {

    return new Promise(resolve => {

        if (window.firebaseDB) {
            resolve(true);
            return;
        }

        const started = Date.now();

        const timer = setInterval(() => {

            if (window.firebaseDB) {
                clearInterval(timer);
                resolve(true);
            } else if (Date.now() - started > timeoutMs) {
                clearInterval(timer);
                resolve(false);
            }
        }, 100);
    });
}


function noteSaveProblem() {

    const el = byId("resultMessage");

    if (!el) {
        return;
    }

    const note =
        " The leaderboard is offline right now, so this score was not saved online.";

    if (!el.textContent.includes("not saved online")) {
        el.textContent += note;
    }
}


saveScore = async function (points) {
    try {
        if (!await waitForFirebase(4000)) {
            noteSaveProblem();
            return;
        }
        const fs = await import(FS_URL);
        await fs.setDoc(fs.doc(window.firebaseDB, "leaderboard", getPlayerId()), {
            name: currentPlayer.name, age: currentPlayer.age, ageGroup: getAgeGroup(currentPlayer.age),
            totalPoints: fs.increment(points), levelsCleared: fs.increment(1),
            lastTopic: currentTopic, updatedAt: Date.now()
        }, { merge: true });
    } catch (e) {
        console.error("Leaderboard save error:", e);
        noteSaveProblem();
    }
};

finishLevel = function (passed) {
    if (passed && wrongAnswers >= MAX_WRONG) passed = false;
    if (passed) {
        const k = getLevelKey(currentLevel);
        const first = localStorage.getItem(k) !== "completed";
        localStorage.setItem(k, "completed");
        unlockNextLevel();
        if (first) saveScore(correctAnswers * 10 + currentLevel * 5);
        speakText("Congratulations! You have passed this level.");
    } else speakText("Oops! You failed this level. Please retry.");
    showResult(passed);
};

loadLeaderboard = async function () {
    const list = byId("leaderboardList");
    if (!list) return;
    list.innerHTML = `<p class="loading-text">Loading leaderboard...</p>`;
    try {
        if (!await waitForFirebase(4000)) { list.innerHTML = `<p class="loading-text">Leaderboard is not available right now.</p>`; return; }
        const fs = await import(FS_URL);
        const snap = await fs.getDocs(fs.query(fs.collection(window.firebaseDB, "leaderboard"), fs.orderBy("totalPoints", "desc"), fs.limit(50)));
        if (snap.empty) { list.innerHTML = `<p class="loading-text">No scores yet. Be the first!</p>`; return; }
        list.innerHTML = ""; let rank = 1; const me = getPlayerId();
        snap.forEach(d => {
            const x = d.data(), item = document.createElement("div");
            item.className = "leaderboard-item";
            if (d.id === me) item.style.outline = "2px solid #ffd166";
            item.innerHTML = `<div class="leaderboard-rank">${rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : rank}</div>
              <div class="leaderboard-name"><strong>${escapeHTML(x.name || "Player")}</strong>
              <small style="display:block;color:#888;margin-top:4px;">Age ${escapeHTML(x.age || "")} • ${escapeHTML(x.ageGroup || "")} • ${x.levelsCleared || 0} levels cleared</small></div>
              <div class="leaderboard-score">${x.totalPoints || 0} pts</div>`;
            list.appendChild(item); rank++;
        });
    } catch (e) { console.error(e); list.innerHTML = `<p class="loading-text">Unable to load leaderboard.<br><small>Error: ${escapeHTML(e.code || e.message || e)}</small></p>`; }
};
window.showLeaderboard = showLeaderboard;

/* =========================================================
   APTITUDEQUEST V3  (load AFTER script.js)
   1. Every age 6..9 gets its own difficulty; 10+ gets its own template window
   2. Interview-style questions (TCS/Infosys/Wipro type) for age 18+
   3. No repeats (exact text across history + same-pattern check inside a level)
   4. Easy clues (idea -> step 1 -> last calculation, answer hidden)
   5. Better female voice + optional cloud human-voice hook
   6. Fix: wrong-answer highlight marked wrong options as correct
========================================================= */

/* ---------- 2. INTERVIEW BANK: [question, answer, wrongs, explanation, hint] ---------- */
const IVQ = {
    numbers: [
        ["What is the remainder when 2^10 is divided by 7?", "2", ["1", "3", "4"], "2^3 = 8 leaves remainder 1, so 2^10 = (2^3)^3 × 2 leaves remainder 2.", "Write the first few powers of 2 and their remainders. Look for a repeating pattern."],
        ["How many prime numbers are there between 1 and 30?", "10", ["9", "11", "8"], "2, 3, 5, 7, 11, 13, 17, 19, 23, 29 → 10 primes.", "Strike out the multiples of 2, 3 and 5 (keep those numbers themselves). 1 is not prime."]
    ],
    logical: [
        ["A is taller than B, B is taller than C, and D is shorter than C. Who is the tallest?", "A", ["B", "C", "D"], "Order: A > B > C > D.", "Write the comparisons as one chain. Where does D fit?"],
        ["Find the missing number: 3, 8, 15, 24, 35, ?", "48", ["46", "50", "45"], "The terms are n² − 1 for n = 2, 3, 4… so the next is 7² − 1 = 48.", "Add 1 to each term. What do you notice?"]
    ],
    percentage: [
        ["The price of petrol rises by 25%. By what percent must consumption fall to keep the expenditure the same?", "20%", ["25%", "15%", "30%"], "Take price 100 → 125. Reduction = 25/125 × 100 = 20%.", "Assume the old price is 100. The reduction is measured against the new price."]
    ],
    profitloss: [
        ["A man buys 12 pens for ₹10 and sells 10 pens for ₹12. What is his profit percent?", "44%", ["20%", "40%", "36%"], "Buy 60 pens for ₹50, sell 60 pens for ₹72. Profit = 22/50 × 100 = 44%.", "Take LCM of 12 and 10 as the number of pens."]
    ],
    timework: [
        ["A and B together finish a job in 6 days. A alone takes 10 days. How many days does B alone take?", "15 days", ["12 days", "16 days", "18 days"], "1/6 − 1/10 = 1/15, so B takes 15 days.", "Subtract A's one-day work from the combined one-day work."]
    ],
    speed: [
        ["A man rows 12 km downstream in 2 hours and 12 km upstream in 3 hours. What is his speed in still water?", "5 km/h", ["4 km/h", "6 km/h", "2 km/h"], "Downstream = 6, upstream = 4. Still water = (6 + 4)/2 = 5 km/h.", "Find both speeds first."]
    ],
    ratio: [
        ["The ages of A and B are in the ratio 3 : 5. After 6 years the ratio becomes 3 : 4. What is B's present age?", "10 years", ["15 years", "8 years", "12 years"], "(3x + 6)/(5x + 6) = 3/4 → x = 2, so B = 10.", "Let the ages be 3x and 5x, then use the ratio after 6 years."]
    ],
    probability: [
        ["Two dice are thrown. What is the probability that the sum is a prime number?", "5/12", ["1/2", "1/3", "7/12"], "Prime sums 2, 3, 5, 7, 11 occur 1 + 2 + 4 + 6 + 2 = 15 ways. 15/36 = 5/12.", "List the prime sums possible with two dice and count the pairs for each."]
    ],
    average: [
        ["The average of 5 consecutive odd numbers is 21. What is the largest number?", "25", ["23", "27", "29"], "The numbers are 17, 19, 21, 23, 25.", "The average of consecutive numbers is the middle one."]
    ]
};

/* ---------- 1. AGE-WISE GENERATOR ---------- */
generateQuestion = function (topicId, age, level) {
    const T = TOPIC_GEN[topicId] || NUMBERS;
    age = Number(age);
    if (age <= 9) {                      // 6,7,8,9 each get a harder number range than the previous age
        const base = age <= 7 ? 6 : 8;
        return T.kid(age <= 7 ? 0 : 1, level + (age - base) * 3);
    }
    if (age >= 18 && level >= 3 && IVQ[topicId] && Math.random() < 0.4) {
        const x = R(IVQ[topicId]);
        return mk(x[0], x[1], x[3], x[4], x[2]);
    }
    const cap = age <= 11 ? 2 : age <= 14 ? 3 : age <= 17 ? 4 : 5;
    const f = T.list.filter(x => x[1] <= cap), n = f.length, b = band(age);
    const h = Math.min(1, (age - 6) / 14);
    const pos = (h * 0.6 + (level - 1) / 9 * 0.4) * (n - 1);
    const i = Math.max(0, Math.min(n - 1, Math.round(pos + Math.random() * 5 - 2.5)));
    return f[i][0](b, level, (b + 1) * (1 + level / 4));
};

/* ---------- 3. NO REPEATS ---------- */
createQuestionSet = function (topicId, level) {
    const key = `AQ_seen_${currentPlayer.age}_${topicId}`;
    let seen = [];
    try { seen = JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) { }
    const pattern = t => t.replace(/[\d.₹%]+/g, "#");
    const build = () => {
        const res = [], pats = []; let t = 0;
        while (res.length < QUESTIONS_PER_LEVEL && t < 500) {
            const q = generateQuestion(topicId, currentPlayer.age, level); t++;
            if (seen.includes(q.question) || res.some(x => x.question === q.question)) continue;
            const p = pattern(q.question);
            if (pats.includes(p) && t < 300) continue;      // avoid same-looking questions in one level
            pats.push(p); res.push(q);
        }
        return res;
    };
    let res = build();
    if (res.length < QUESTIONS_PER_LEVEL) { seen = []; res = build(); }   // everything used: start a fresh cycle
    seen.push(...res.map(q => q.question));
    try { localStorage.setItem(key, JSON.stringify(seen.slice(-800))); } catch (e) { }
    return res;
};

/* ---------- 4. ONE EASY CLUE ----------
   Just one clue — an easy hint that points to how to solve it,
   without giving away the final answer. */
const _mq = makeQuestion;
makeQuestion = function (...args) {
    const q = _mq(...args);
    q.clue = `💡 ${q.clues[0]}`;
    return q;
};

const _dq = displayQuestion;
displayQuestion = function () {
    clueUsed = false;
    _dq();
};
useClue = function () {
    if (clueUsed) return;
    const q = questions[currentQuestionIndex];
    if (!q) return;
    clueUsed = true;
    const box = byId("clueText");
    if (box) box.textContent = q.clue;
    const b = byId("clueBtn");
    if (b) { b.disabled = true; b.textContent = "✓ Clue Used"; }
};

/* ---------- 6. HIGHLIGHT FIX ---------- */
const _sel = selectAnswer;
selectAnswer = function (a, btn) {
    _sel(a, btn);
    const ans = String(questions[currentQuestionIndex].answer);
    document.querySelectorAll(".option-button").forEach(b => {
        const t = b.textContent.replace(/^[A-D]\.\s*/, "").trim();
        if (t === ans) b.classList.add("correct"); else b.classList.remove("correct");
    });
};

/* ---------- 5. VOICE ---------- */
/* Browser voices depend on the device. For a truly human voice, deploy a small
   text-to-speech endpoint (Google Cloud / Azure neural voice) that returns audio
   for POST {text}, then set:  window.AQ_TTS_URL = "https://your-endpoint";  */
pickVoice = function () {
    const v = speechSynthesis.getVoices().filter(x => /^en/i.test(x.lang));
    const prefs = [/(Neerja|Swara).*Natural|Natural.*(Neerja|Swara)/i, /Natural.*(Aria|Jenny|Sonia|Libby|Ava|Emma)/i,
        /Google UK English Female/i, /Samantha|Karen|Tessa|Moira|Serena/i, /Zira|Heera|Veena/i, /female/i];
    for (const p of prefs) { const f = v.find(x => p.test(x.name)); if (f) return f; }
    return v[0] || null;
};
if ("speechSynthesis" in window) chosenVoice = pickVoice();

let aqAudio = null;
const _speak = speakText;
speakText = function (text) {
    if (aqAudio) { aqAudio.pause(); aqAudio = null; }
    if (!window.AQ_TTS_URL) return _speak(text);
    fetch(window.AQ_TTS_URL, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanForSpeech(SAY[text] || text) })
    }).then(res => res.blob()).then(b => { aqAudio = new Audio(URL.createObjectURL(b)); aqAudio.play(); })
        .catch(() => _speak(text));
};

/* =========================================================
   APTITUDEQUEST FX LAYER  (appended - premium game feel)
   Motion, sound, particles, HUD.
   This section only WRAPS existing functions; no game rule,
   id, class name or Firebase call is changed or removed.
========================================================= */

const AQ_MOTION_MQ = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

let aqReduced = !!(AQ_MOTION_MQ && AQ_MOTION_MQ.matches);
let aqMuted = false;
let aqStreak = 0;
let aqLastLevelDone = 0;

try { aqMuted = localStorage.getItem("AQ_muted") === "1"; } catch (e) { aqMuted = false; }

function aqBy(id) { return document.getElementById(id); }
function aqQ(sel, root) { return (root || document).querySelector(sel); }
function aqAll(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

function aqRetrigger(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
}

function aqIndex(root, sel) {
    aqAll(sel, root).forEach(function (el, i) { el.style.setProperty("--aq-i", i); });
}


/* ---------- 1. SOUND (Web Audio, no assets) ---------- */

let aqActx = null;

function aqCtx() {
    if (aqMuted) return null;
    try {
        if (!aqActx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            aqActx = new AC();
        }
        if (aqActx.state === "suspended") aqActx.resume();
        return aqActx;
    } catch (e) { return null; }
}

function aqTone(o) {
    const c = aqCtx();
    if (!c) return;
    try {
        const t = c.currentTime + (o.delay || 0);
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = o.type || "sine";
        osc.frequency.setValueAtTime(o.f, t);
        if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(30, o.f2), t + o.d);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(o.v || 0.15, t + 0.014);
        g.gain.exponentialRampToValueAtTime(0.0001, t + o.d);
        osc.connect(g);
        g.connect(c.destination);
        osc.start(t);
        osc.stop(t + o.d + 0.03);
    } catch (e) { /* audio is optional */ }
}

const AQ_SFX = {
    click: function () { aqTone({ f: 540, f2: 720, d: 0.07, type: "triangle", v: 0.1 }); },
    deny: function () { aqTone({ f: 160, f2: 110, d: 0.13, type: "square", v: 0.07 }); },
    correct: function () {
        aqTone({ f: 660, d: 0.1, type: "triangle", v: 0.15 });
        aqTone({ f: 880, d: 0.12, type: "triangle", v: 0.13, delay: 0.08 });
        aqTone({ f: 1320, d: 0.2, type: "sine", v: 0.11, delay: 0.16 });
    },
    wrong: function () {
        aqTone({ f: 240, f2: 100, d: 0.3, type: "sawtooth", v: 0.12 });
        aqTone({ f: 120, d: 0.22, type: "square", v: 0.06, delay: 0.02 });
    },
    star: function () { aqTone({ f: 1180, f2: 1560, d: 0.1, type: "sine", v: 0.09 }); },
    unlock: function () { aqTone({ f: 420, f2: 940, d: 0.32, type: "sine", v: 0.13 }); },
    complete: function () {
        [523, 659, 784, 1046, 1318].forEach(function (f, i) {
            aqTone({ f: f, d: 0.24, type: "triangle", v: 0.14, delay: i * 0.1 });
        });
    },
    fail: function () {
        [392, 330, 262].forEach(function (f, i) {
            aqTone({ f: f, d: 0.3, type: "sine", v: 0.12, delay: i * 0.14 });
        });
    }
};

function aqSfx(name) {
    if (aqMuted) return;
    try { if (AQ_SFX[name]) AQ_SFX[name](); } catch (e) { /* ignore */ }
}

function aqVibe(pattern) {
    if (aqMuted) return;
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* not supported */ }
}

function aqSyncSoundBtn() {
    const b = aqBy("aqSoundBtn");
    if (!b) return;
    b.setAttribute("aria-pressed", String(aqMuted));
    b.textContent = aqMuted ? "🔇" : "🔊";
}


/* ---------- 2. CANVAS PARTICLES ---------- */

const aqCanvas = aqBy("aqFxCanvas");
const aqG = aqCanvas && aqCanvas.getContext ? aqCanvas.getContext("2d") : null;
let aqParts = [];
let aqRaf = 0;
const AQ_COLORS = ["#ffd166", "#ff6b8a", "#4ee69a", "#38bdf8", "#a78bfa", "#ffffff", "#ff9f43"];

function aqResizeCanvas() {
    if (!aqCanvas || !aqG) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    aqCanvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
    aqCanvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
    aqG.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function aqPush(p) {
    if (!aqG || aqReduced) return;
    if (aqParts.length > 460) return;
    aqParts.push(p);
    aqStartLoop();
}

function aqStartLoop() {
    if (aqRaf || !aqG) return;
    aqRaf = window.requestAnimationFrame(aqTick);
}

function aqStopLoop() {
    if (aqRaf) { window.cancelAnimationFrame(aqRaf); aqRaf = 0; }
    aqParts = [];
    if (aqG) aqG.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

function aqTick() {
    aqRaf = 0;
    if (!aqG) return;
    const W = window.innerWidth, H = window.innerHeight;
    aqG.clearRect(0, 0, W, H);

    for (let i = aqParts.length - 1; i >= 0; i--) {
        const p = aqParts[i];
        p.vy += p.g === undefined ? 0.16 : p.g;
        p.x += p.vx;
        p.y += p.vy;
        if (p.drag) { p.vx *= p.drag; p.vy *= p.drag; }
        p.rot = (p.rot || 0) + (p.spin || 0);
        p.life -= p.decay;

        if (p.k === "rocket") {
            aqG.globalAlpha = 1;
            aqG.fillStyle = p.c;
            aqG.beginPath();
            aqG.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            aqG.fill();
            if (p.y <= p.ty || p.vy >= 0) {
                aqExplode(p.x, p.y, p.c, 34);
                aqParts.splice(i, 1);
            }
            continue;
        }

        if (p.life <= 0 || p.y > H + 40) { aqParts.splice(i, 1); continue; }

        aqG.globalAlpha = Math.max(0, Math.min(1, p.life));
        if (p.k === "rect") {
            aqG.save();
            aqG.translate(p.x, p.y);
            aqG.rotate(p.rot);
            aqG.fillStyle = p.c;
            aqG.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            aqG.restore();
        } else {
            aqG.fillStyle = p.c;
            aqG.beginPath();
            aqG.arc(p.x, p.y, Math.max(0.4, p.r * (p.k === "spark" ? p.life : 1)), 0, Math.PI * 2);
            aqG.fill();
        }
    }

    aqG.globalAlpha = 1;
    if (aqParts.length) aqRaf = window.requestAnimationFrame(aqTick);
}

function aqExplode(x, y, color, n) {
    if (aqReduced || !aqG) return;
    for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.3;
        const sp = 2 + Math.random() * 4.5;
        aqPush({
            k: Math.random() < 0.5 ? "spark" : "rect",
            x: x, y: y,
            vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1,
            g: 0.12, drag: 0.985,
            r: 1.6 + Math.random() * 2.2,
            w: 4 + Math.random() * 4, h: 3 + Math.random() * 5,
            rot: Math.random() * 6, spin: (Math.random() - 0.5) * 0.3,
            life: 1, decay: 0.014 + Math.random() * 0.012,
            c: color || AQ_COLORS[(Math.random() * AQ_COLORS.length) | 0]
        });
    }
}

function aqBurstAt(el, color, n) {
    if (aqReduced || !aqG || !el) return;
    const r = el.getBoundingClientRect();
    aqExplode(r.left + r.width / 2, r.top + r.height / 2, color, n || 24);
}

function aqConfetti(n) {
    if (aqReduced || !aqG) return;
    const W = window.innerWidth;
    for (let i = 0; i < (n || 120); i++) {
        aqPush({
            k: "rect",
            x: Math.random() * W,
            y: -20 - Math.random() * window.innerHeight * 0.4,
            vx: (Math.random() - 0.5) * 2.4,
            vy: 2 + Math.random() * 3.5,
            g: 0.045,
            w: 5 + Math.random() * 6, h: 8 + Math.random() * 8,
            rot: Math.random() * 6, spin: (Math.random() - 0.5) * 0.28,
            life: 1, decay: 0.0022,
            c: AQ_COLORS[(Math.random() * AQ_COLORS.length) | 0]
        });
    }
}

function aqFireworks(rounds) {
    if (aqReduced || !aqG) return;
    const W = window.innerWidth, H = window.innerHeight;
    for (let i = 0; i < (rounds || 4); i++) {
        setTimeout(function () {
            if (document.hidden) return;
            const x = W * (0.18 + Math.random() * 0.64);
            aqPush({
                k: "rocket", x: x, y: H + 12,
                vx: (Math.random() - 0.5) * 1.1, vy: -(8 + Math.random() * 3.5),
                g: 0.055, ty: H * (0.14 + Math.random() * 0.28),
                r: 2.6, life: 1, decay: 0,
                c: AQ_COLORS[(Math.random() * AQ_COLORS.length) | 0]
            });
        }, i * 420);
    }
}


/* ---------- 3. DOM FX HELPERS ---------- */

function aqEdge(kind) {
    const el = aqBy("aqEdgeFlash");
    if (!el || aqReduced) return;
    el.classList.remove("aq-good", "aq-bad");
    void el.offsetWidth;
    el.classList.add(kind);
    setTimeout(function () { el.classList.remove(kind); }, 700);
}

function aqFloat(x, y, text, color) {
    if (aqReduced) return;
    const el = document.createElement("div");
    el.className = "aq-float";
    el.textContent = text;
    if (color) el.style.color = color;
    el.style.left = Math.round(x) + "px";
    el.style.top = Math.round(y) + "px";
    document.body.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1150);
}

function aqFloatFrom(el, text, color) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    aqFloat(r.left + r.width / 2 - 22, r.top - 6, text, color);
}

function aqCountUp(el, to, dur, fmt) {
    if (!el) return;
    const target = Number(to) || 0;
    const render = function (v) { el.textContent = fmt ? fmt(v) : String(v); };
    if (aqReduced || !dur) { render(target); return; }
    const t0 = performance.now();
    const step = function (now) {
        const p = Math.min(1, (now - t0) / dur);
        render(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}


/* ---------- 4. HEARTS / STREAK / PROGRESS ---------- */

function aqRenderHearts() {
    const host = aqBy("livesHearts");
    if (!host) return;
    host.innerHTML = "";
    for (let i = 0; i < MAX_WRONG; i++) {
        const s = document.createElement("span");
        s.className = "aq-heart";
        s.textContent = "❤";
        host.appendChild(s);
    }
}

function aqLoseHeart() {
    const host = aqBy("livesHearts");
    if (!host) return;
    const alive = aqAll(".aq-heart:not(.aq-lost)", host);
    const last = alive[alive.length - 1];
    if (last) {
        last.classList.add("aq-lost");
        aqFloatFrom(last, "💔", "#ff9aa8");
    }
}

function aqUpdateStreak() {
    const el = aqBy("aqStreak");
    const tx = aqBy("aqStreakText");
    if (!el) return;
    if (aqStreak >= 2) {
        if (tx) tx.textContent = aqStreak + " in a row!";
        aqRetrigger(el, "aq-on");
    } else {
        el.classList.remove("aq-on");
    }
}

function aqTintProgress() {
    const bar = aqBy("progressBar");
    if (!bar) return;
    bar.classList.remove("aq-good", "aq-bad");
    if (wrongAnswers >= 2) bar.classList.add("aq-bad");
    else if (correctAnswers >= 3) bar.classList.add("aq-good");
}

function aqBumpScore() {
    const el = aqBy("questionScore");
    if (!el) return;
    aqCountUp(el, correctAnswers, 420, function (v) { return "Score: " + v; });
    aqRetrigger(el, "aq-bump");
}


/* ---------- 5. XP HUD ---------- */

function aqTotalXp() {
    let levels = 0;
    try {
        TOPICS.forEach(function (t) { levels += getTopicCompletedCount(t.id); });
    } catch (e) { return 0; }
    return levels * 25;
}

function aqUpdateHud(animate) {
    const xp = aqTotalXp();
    const level = Math.floor(xp / 100) + 1;
    const fill = aqBy("aqXpFill");
    const badge = aqBy("aqXpLevel");
    const label = aqBy("aqXpText");
    if (fill) fill.style.setProperty("--xp", ((xp % 100) / 100).toFixed(3));
    if (badge) {
        const prev = badge.textContent;
        badge.textContent = String(level);
        if (animate && prev !== String(level)) {
            aqRetrigger(badge, "aq-up");
            aqSfx("unlock");
        }
    }
    aqCountUp(label, xp, animate ? 800 : 0);
}


/* ---------- 6. HOME SCREEN ---------- */

function aqSplitTitle() {
    const title = aqQ(".game-title");
    if (!title || title.getAttribute("data-aq-split")) return;
    title.setAttribute("data-aq-split", "1");
    let i = 0;
    const walk = function (node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (kid) {
            if (kid.nodeType === 3) {
                const text = kid.textContent;
                if (!text || !text.trim()) return;
                const frag = document.createDocumentFragment();
                Array.prototype.forEach.call(text, function (ch) {
                    if (ch === " ") { frag.appendChild(document.createTextNode(" ")); return; }
                    const s = document.createElement("i");
                    s.className = "aq-ch";
                    s.textContent = ch;
                    s.style.setProperty("--i", i++);
                    frag.appendChild(s);
                });
                node.replaceChild(frag, kid);
            } else if (kid.nodeType === 1) {
                walk(kid);
            }
        });
    };
    walk(title);
}

function aqMakeParticles() {
    const host = aqBy("aqParticles");
    if (!host || host.childElementCount) return;
    const n = window.innerWidth < 600 ? 12 : 20;
    for (let i = 0; i < n; i++) {
        const d = document.createElement("span");
        d.className = "aq-particle";
        d.style.left = (Math.random() * 100).toFixed(2) + "%";
        d.style.setProperty("--s", (3 + Math.random() * 6).toFixed(1) + "px");
        d.style.setProperty("--dur", (13 + Math.random() * 16).toFixed(1) + "s");
        d.style.setProperty("--delay", (-Math.random() * 22).toFixed(1) + "s");
        d.style.setProperty("--drift", (Math.random() * 130 - 65).toFixed(0) + "px");
        host.appendChild(d);
    }
}

function aqBindAvatarPop() {
    ["nameInput", "ageInput"].forEach(function (id) {
        const el = aqBy(id);
        if (!el || el.getAttribute("data-aq-pop")) return;
        el.setAttribute("data-aq-pop", "1");
        let last = 0;
        el.addEventListener("input", function () {
            const now = Date.now();
            if (now - last < 240) return;
            last = now;
            aqRetrigger(aqQ(".avatar"), "aq-pop");
        });
    });
}


/* ---------- 7. PARALLAX ---------- */

let aqPx = 0, aqPy = 0, aqPTick = false;

function aqParallax(cx, cy) {
    if (aqReduced) return;
    aqPx = (cx / window.innerWidth) * 2 - 1;
    aqPy = (cy / window.innerHeight) * 2 - 1;
    if (aqPTick) return;
    aqPTick = true;
    window.requestAnimationFrame(function () {
        aqPTick = false;
        const root = document.documentElement;
        root.style.setProperty("--mx", aqPx.toFixed(3));
        root.style.setProperty("--my", aqPy.toFixed(3));
    });
}


/* ---------- 8. TOPIC CARDS ---------- */

function aqTilt(card) {
    if (aqReduced || card.getAttribute("data-aq-tilt")) return;
    card.setAttribute("data-aq-tilt", "1");
    const reset = function () {
        card.classList.remove("tilting");
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
    };
    card.addEventListener("pointermove", function (e) {
        if (e.pointerType === "touch") return;
        const r = card.getBoundingClientRect();
        if (!r.width || !r.height) return;
        card.classList.add("tilting");
        card.style.setProperty("--ry", (((e.clientX - r.left) / r.width - 0.5) * 11).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((0.5 - (e.clientY - r.top) / r.height) * 9).toFixed(2) + "deg");
    });
    card.addEventListener("pointerleave", reset);
    card.addEventListener("pointercancel", reset);
}

function aqDecorateTopics() {
    const grid = aqBy("topicGrid");
    if (!grid) return;
    const cards = aqAll(".topic-card", grid);
    cards.forEach(function (c, i) {
        c.style.setProperty("--aq-i", i);
        aqTilt(c);
    });
}


/* ---------- 9. ADVENTURE MAP ---------- */

function aqPlaceMascot(nodes, animate) {
    const map = aqQ(".adventure-map");
    if (!map || !nodes.length) return;
    let m = aqQ(".aq-mascot", map);
    const fresh = !m;
    if (!m) {
        m = document.createElement("div");
        m.className = "aq-mascot";
        m.innerHTML = "<i>🐰</i>";
        map.appendChild(m);
    }
    const target = nodes.filter(function (n) { return n.classList.contains("current"); })[0] || nodes[nodes.length - 1];
    if (!target) return;
    const mr = map.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    if (!mr.width) return;
    if (fresh || !animate) {
        m.style.transition = "none";
    }
    m.style.setProperty("--px", Math.round(tr.left - mr.left + tr.width / 2 - 15) + "px");
    m.style.setProperty("--py", Math.round(tr.top - mr.top - 36) + "px");
    if (fresh || !animate) {
        void m.offsetWidth;
        m.style.transition = "";
    }
}

function aqDecorateMap() {
    const path = aqBy("levelPath");
    if (!path) return;
    const nodes = aqAll(".level-node", path);
    nodes.forEach(function (n, i) {
        n.style.setProperty("--aq-i", i);
        if (n.classList.contains("completed") && !aqQ(".aq-stars", n)) {
            const row = document.createElement("div");
            row.className = "aq-stars";
            for (let k = 0; k < 3; k++) {
                const s = document.createElement("i");
                s.textContent = "★";
                s.style.setProperty("--aq-i", k + i * 0.4);
                row.appendChild(s);
            }
            n.appendChild(row);
        }
    });

    let road = aqQ(".aq-road", path);
    if (!road) {
        road = document.createElement("div");
        road.className = "aq-road";
        road.innerHTML = "<i class=\"aq-road-fill\"></i>";
        path.appendChild(road);
    }
    const fill = road.firstElementChild;
    const done = nodes.filter(function (n) { return n.classList.contains("completed"); }).length;
    if (fill) {
        fill.style.setProperty("--p", "0");
        window.requestAnimationFrame(function () {
            fill.style.setProperty("--p", Math.min(1, done / TOTAL_LEVELS).toFixed(3));
        });
    }

    const castle = aqQ(".finish-castle");
    if (castle) castle.classList.toggle("aq-done", done >= TOTAL_LEVELS);

    /* the screen entrance animation scales the map, so measure the mascot
       target only after it has settled */
    setTimeout(function () {
        aqPlaceMascot(aqAll(".level-node", aqBy("levelPath") || document), true);
    }, 520);
}

function aqMapTap(e) {
    const map = aqQ(".adventure-map");
    if (!map) return;
    const locked = aqAll(".level-node.locked", map);
    for (let i = 0; i < locked.length; i++) {
        const r = locked[i].getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
            aqRetrigger(locked[i], "aq-wiggle");
            aqSfx("deny");
            aqVibe(28);
            return;
        }
    }
}


/* ---------- 10. RESULT SCREEN ---------- */

function aqStarsEarned() {
    if (correctAnswers >= QUESTIONS_PER_LEVEL) return 3;
    if (correctAnswers >= QUESTIONS_PER_LEVEL - 1) return 2;
    return 1;
}

function aqCelebrate(passed) {
    const icon = aqBy("resultIcon");
    const starRow = aqBy("resultStars");

    aqIndex(aqBy("resultButtons"), "button");
    aqIndex(aqQ(".result-card"), ".result-card > div");

    const answered = correctAnswers + wrongAnswers;
    const acc = answered > 0 ? Math.round((correctAnswers / answered) * 100) : 0;
    aqCountUp(aqBy("finalLevelScore"), currentLevel, 500);
    aqCountUp(aqBy("correctCount"), correctAnswers, 700);
    aqCountUp(aqBy("wrongCount"), wrongAnswers, 700);
    aqCountUp(aqBy("accuracyCount"), acc, 950, function (v) { return v + "%"; });

    if (icon) { icon.classList.remove("aq-win", "aq-lose"); void icon.offsetWidth; }

    if (!passed) {
        if (icon) icon.classList.add("aq-lose");
        if (starRow) starRow.style.display = "none";
        aqSfx("fail");
        aqVibe([40, 60, 40]);
        return;
    }

    if (icon) icon.classList.add("aq-win");
    aqSfx("complete");
    aqVibe([30, 50, 30, 50, 90]);
    aqConfetti(window.innerWidth < 600 ? 90 : 150);
    aqFireworks(currentLevel === TOTAL_LEVELS ? 6 : 3);
    aqEdge("aq-good");

    if (starRow) {
        starRow.style.display = "";
        const stars = aqAll("i", starRow);
        const earned = aqStarsEarned();
        stars.forEach(function (s, i) {
            s.classList.remove("aq-lit");
            s.style.color = "";
            if (i < earned) {
                setTimeout(function () {
                    s.classList.add("aq-lit");
                    aqSfx("star");
                    const r = s.getBoundingClientRect();
                    if (r.width) aqExplode(r.left + r.width / 2, r.top + r.height / 2, "#ffd166", 12);
                }, 420 + i * 320);
            } else {
                s.style.color = "rgba(255,255,255,.16)";
            }
        });
    }
}


/* ---------- 11. LEADERBOARD ---------- */

function aqDecorateLeaderboard() {
    const list = aqBy("leaderboardList");
    if (!list) return;
    const rows = aqAll(".leaderboard-item", list);
    rows.forEach(function (row, i) {
        row.style.setProperty("--aq-i", Math.min(i, 14));
        if (i === 0) row.classList.add("aq-r1");
        if (i === 1) row.classList.add("aq-r2");
        if (i === 2) row.classList.add("aq-r3");
        if (row.style.outline) {
            row.style.outline = "";
            row.classList.add("aq-me");
        }
    });
}


/* ---------- 12. QUESTION SCREEN ---------- */

function aqOnQuestion() {
    const card = aqQ("#quizScreen .question-card");
    aqRetrigger(card, "aq-in");

    const box = aqBy("optionsContainer");
    if (box) {
        const opts = aqAll(".option-button", box);
        opts.forEach(function (b, i) {
            b.style.setProperty("--aq-i", i);
            b.style.setProperty("--from", (i % 2 === 0 ? -46 : 46) + "px");
        });
    }

    const fb = aqBy("feedback");
    if (fb) fb.classList.remove("aq-in", "correct", "wrong");

    aqTintProgress();
}


/* ---------- 13. HOOKS (wrap pattern) ---------- */

const _aqShowScreen = showScreen;
showScreen = function (screenId) {
    _aqShowScreen(screenId);
    aqUpdateHud(false);
    if (screenId === "homeScreen") { aqSplitTitle(); aqBindAvatarPop(); }
    if (screenId !== "quizScreen") aqStreak = 0;
};

const _aqRenderTopics = renderTopics;
renderTopics = function () {
    _aqRenderTopics();
    aqDecorateTopics();
};

const _aqRenderLevelMap = renderLevelMap;
renderLevelMap = function () {
    _aqRenderLevelMap();
    aqDecorateMap();
};

const _aqStartLevel = startLevel;
startLevel = function (level) {
    aqStreak = 0;
    aqUpdateStreak();
    _aqStartLevel(level);
    aqRenderHearts();
};

const _aqDisplayQuestion = displayQuestion;
displayQuestion = function () {
    _aqDisplayQuestion();
    aqOnQuestion();
};

const _aqUseClue = useClue;
useClue = function () {
    _aqUseClue();
    const box = aqBy("clueText");
    if (box && box.textContent) aqRetrigger(box, "aq-in");
    aqSfx("click");
};

const _aqSelectAnswer = selectAnswer;
selectAnswer = function (answer, btn) {
    const before = correctAnswers;
    const beforeWrong = wrongAnswers;
    const wasAnswered = answeredCurrentQuestion;

    _aqSelectAnswer(answer, btn);

    if (wasAnswered) return;
    if (correctAnswers === before && wrongAnswers === beforeWrong) return;

    const isCorrect = correctAnswers > before;

    if (isCorrect) {
        aqStreak++;
        aqSfx("correct");
        aqVibe(22);
        aqEdge("aq-good");
        aqBurstAt(btn, aqStreak >= 3 ? "#ff9f43" : "#4ee69a", aqStreak >= 3 ? 34 : 22);
        aqFloatFrom(btn, "+10", "#7bffc0");
        aqBumpScore();
        if (aqStreak === 3) aqFloat(window.innerWidth / 2 - 60, window.innerHeight / 2 - 40, "🔥 STREAK!", "#ff9f43");
    } else {
        aqStreak = 0;
        aqSfx("wrong");
        aqVibe([55, 45, 55]);
        aqEdge("aq-bad");
        if (btn) aqRetrigger(btn, "aq-shake-it");
        const container = aqQ(".quiz-container");
        aqRetrigger(container, "aq-shake-it");
        aqLoseHeart();
    }

    aqUpdateStreak();
    aqTintProgress();
};

const _aqShowResult = showResult;
showResult = function (passed) {
    _aqShowResult(passed);
    aqCelebrate(passed);
};

const _aqFinishLevel = finishLevel;
finishLevel = function (passed) {
    const topicDoneBefore = currentTopic ? getTopicCompletedCount(currentTopic) : 0;
    _aqFinishLevel(passed);
    aqUpdateHud(true);
    if (passed) {
        const after = currentTopic ? getTopicCompletedCount(currentTopic) : 0;
        if (after > topicDoneBefore) aqSfx("unlock");
        if (after >= TOTAL_LEVELS) {
            aqConfetti(window.innerWidth < 600 ? 110 : 180);
            aqFireworks(7);
        }
    }
};

const _aqLoadLeaderboard = loadLeaderboard;
loadLeaderboard = async function () {
    const out = await _aqLoadLeaderboard.apply(this, arguments);
    aqDecorateLeaderboard();
    return out;
};


/* ---------- 14. GLOBAL LISTENERS + BOOT ---------- */

document.addEventListener("click", function (e) {
    const t = e.target;
    if (!t || !t.closest) return;
    const hit = t.closest("button, .topic-card, .level-node");
    if (!hit || hit.disabled) return;
    if (hit.classList.contains("option-button")) return;
    if (hit.id === "aqSoundBtn") return;
    aqSfx("click");
}, true);

document.addEventListener("pointerdown", function (e) {
    const map = aqQ(".adventure-map");
    if (map && map.contains(e.target)) aqMapTap(e);
}, { passive: true });

window.addEventListener("pointermove", function (e) {
    aqParallax(e.clientX, e.clientY);
}, { passive: true });

window.addEventListener("touchmove", function (e) {
    if (e.touches && e.touches[0]) aqParallax(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });

window.addEventListener("resize", function () {
    aqResizeCanvas();
    const path = aqBy("levelPath");
    if (path && path.childElementCount) aqPlaceMascot(aqAll(".level-node", path), false);
});

document.addEventListener("visibilitychange", function () {
    document.body.classList.toggle("fx-paused", document.hidden);
    if (document.hidden) aqStopLoop();
});

if (AQ_MOTION_MQ) {
    const onChange = function (e) {
        aqReduced = !!e.matches;
        document.body.classList.toggle("aq-reduced", aqReduced);
        if (aqReduced) aqStopLoop();
    };
    if (AQ_MOTION_MQ.addEventListener) AQ_MOTION_MQ.addEventListener("change", onChange);
    else if (AQ_MOTION_MQ.addListener) AQ_MOTION_MQ.addListener(onChange);
}

function aqInitFx() {
    document.body.classList.add("aq-hud-on");
    document.body.classList.toggle("aq-reduced", aqReduced);
    aqResizeCanvas();
    aqMakeParticles();
    aqSplitTitle();
    aqBindAvatarPop();
    aqSyncSoundBtn();
    aqRenderHearts();
    aqUpdateHud(false);

    const btn = aqBy("aqSoundBtn");
    if (btn) {
        btn.addEventListener("click", function () {
            aqMuted = !aqMuted;
            try { localStorage.setItem("AQ_muted", aqMuted ? "1" : "0"); } catch (e) { /* private mode */ }
            aqSyncSoundBtn();
            if (!aqMuted) aqSfx("click");
        });
    }
}

aqInitFx();
document.addEventListener("DOMContentLoaded", function () {
    aqUpdateHud(false);
    aqDecorateTopics();
});

window.AQfx = {
    confetti: aqConfetti,
    fireworks: aqFireworks,
    burst: aqExplode,
    sfx: aqSfx,
    updateHud: aqUpdateHud,
    set muted(v) { aqMuted = !!v; aqSyncSoundBtn(); },
    get muted() { return aqMuted; }
};
