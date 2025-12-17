/**
 * Quiz CSV Import/Export Utilities
 * 
 * CSV Format:
 * Question, Option A, Option B, Option C, Option D, Correct Answer, Explanation
 * 
 * - Correct Answer: A, B, C, or D
 * - True/False: Option A = "TRUE", Option B = "FALSE", C & D empty
 */

export interface QuizQuestion {
    text: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE";
}

export interface CSVParseResult {
    success: boolean;
    questions: QuizQuestion[];
    errors: string[];
}

/**
 * Parse CSV string into quiz questions
 */
export function parseQuizCSV(csvContent: string): CSVParseResult {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
    const questions: QuizQuestion[] = [];
    const errors: string[] = [];

    // Skip header row
    if (lines.length < 2) {
        return {
            success: false,
            questions: [],
            errors: ["CSV file is empty or has no data rows"],
        };
    }

    // Parse each data row (skip header)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const rowNum = i + 1;

        try {
            const columns = parseCSVLine(line);

            if (columns.length < 7) {
                errors.push(`Row ${rowNum}: Not enough columns (expected 7, got ${columns.length})`);
                continue;
            }

            const [questionText, optA, optB, optC, optD, correctAnswer, explanation] = columns;

            // Validate question text
            if (!questionText.trim()) {
                errors.push(`Row ${rowNum}: Question text is empty`);
                continue;
            }

            // Build options array (only non-empty options)
            const allOptions = [optA, optB, optC, optD];
            const options = allOptions.filter(opt => opt && opt.trim());

            if (options.length < 2) {
                errors.push(`Row ${rowNum}: At least 2 options are required`);
                continue;
            }

            // Parse correct answer (A, B, C, D)
            const answerLetter = correctAnswer.trim().toUpperCase();
            const answerMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
            const correctAnswerIndex = answerMap[answerLetter];

            if (correctAnswerIndex === undefined) {
                errors.push(`Row ${rowNum}: Invalid answer "${correctAnswer}" (must be A, B, C, or D)`);
                continue;
            }

            if (correctAnswerIndex >= options.length) {
                errors.push(`Row ${rowNum}: Answer "${answerLetter}" is out of range (only ${options.length} options)`);
                continue;
            }

            // Determine question type
            const isTrueFalse =
                options.length === 2 &&
                options[0].toUpperCase() === "TRUE" &&
                options[1].toUpperCase() === "FALSE";

            questions.push({
                text: questionText.trim(),
                options: isTrueFalse ? ["True", "False"] : options.map(o => o.trim()),
                correctAnswerIndex,
                explanation: explanation?.trim() || "",
                type: isTrueFalse ? "TRUE_FALSE" : "MULTIPLE_CHOICE",
            });
        } catch (error) {
            errors.push(`Row ${rowNum}: Failed to parse - ${error}`);
        }
    }

    return {
        success: errors.length === 0 && questions.length > 0,
        questions,
        errors,
    };
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                current += '"';
                i++;
            } else {
                // Toggle quote mode
                inQuotes = !inQuotes;
            }
        } else if (char === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

/**
 * Strip HTML tags from text (for export)
 */
function stripHtml(html: string): string {
    if (!html) return "";

    // Create a temporary element to parse HTML
    if (typeof document !== "undefined") {
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }

    // Fallback for SSR: use regex
    return html
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
        .replace(/&amp;/g, "&")  // Replace &amp; with &
        .replace(/&lt;/g, "<")   // Replace &lt; with <
        .replace(/&gt;/g, ">")   // Replace &gt; with >
        .replace(/&quot;/g, '"') // Replace &quot; with "
        .trim();
}

/**
 * Convert quiz questions to CSV string
 */
export function quizToCSV(questions: QuizQuestion[]): string {
    const header = "Question,Option A,Option B,Option C,Option D,Correct Answer,Explanation";

    const rows = questions.map(q => {
        const options = [...q.options];
        // Pad to 4 options
        while (options.length < 4) {
            options.push("");
        }

        const answerLetter = ["A", "B", "C", "D"][q.correctAnswerIndex] || "A";

        // Strip HTML from question text and explanation for clean CSV
        return [
            escapeCSV(stripHtml(q.text)),
            escapeCSV(options[0]),
            escapeCSV(options[1]),
            escapeCSV(options[2]),
            escapeCSV(options[3]),
            answerLetter,
            escapeCSV(stripHtml(q.explanation)),
        ].join(",");
    });

    return [header, ...rows].join("\n");
}

/**
 * Escape a value for CSV (handle quotes and commas)
 */
function escapeCSV(value: string): string {
    if (!value) return '""';

    // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
    }

    return `"${value}"`;
}

/**
 * Download CSV as file
 */
export function downloadCSV(content: string, filename: string) {
    const blob = new Blob(["\ufeff" + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Generate empty template CSV
 */
export function getTemplateCSV(): string {
    return `Question,Option A,Option B,Option C,Option D,Correct Answer,Explanation
"What is 2 + 2?","1","2","3","4","D","Basic addition: 2 + 2 = 4"
"React is a JavaScript library","TRUE","FALSE","","","A","React is a JS library created by Meta"
"What is the capital of Vietnam?","Ho Chi Minh City","Ha Noi","Da Nang","Hue","B","Ha Noi has been the capital since 1010"`;
}
