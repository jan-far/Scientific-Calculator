const buttons = document.querySelector(".calculator");
const operationOutput = document.querySelector(".operation .value");
const resultOutput = document.querySelector(".result .value");
const RadianBtn = document.querySelector("#Rad");
const DegreeBtn = document.querySelector("#Deg");

let data = {
  operation: [],
  formula: [],
};

let E = Math.E;
let ans;
RadianBtn.classList.add("active-mode");
let RADIAN = true;
let DEGREE = false;
const POWER = "Math.pow(";
const FACTORIAL = "factorial(";
const OPERATORS = ["+", "-", "/", "*"];

// SEARCH FUNCTION - RETURNS AN ARRAY OF POSITION INDEXes OF KEYWORD
const search = (array, keyword) => {
  let result = [];
  array.forEach((e, i) => {
    if (e === keyword) result.push(i);
  });
  return result;
};

// SEARCHMATH FUNCTION - RETURNS AN ARRAY OF POSITION INDEXes OF THE REGEX STRING
const searchMath = (array, regEx) => {
  let result = [];
  const regSearch = regEx;
  array.forEach((e, i) => {
    if (e.match(regSearch)) {
      result.push(i);
    }
  });

  return result;
};

// UPDATE INPUT DATA
const updateData = (value, symbol) => {
  data.formula.push(value);
  data.operation.push(symbol);
};

// Output INPUT TO THE SCREEN
const updateOutputOperation = () => {
  operationOutput.innerHTML = data.operation.join("");
};

const calculate = () => {
  const formula = data.formula;
  let formula_str = formula.join("");

  // FIX POWER AND FACTORIAL ISSUES
  // SEARCH FOR THE POWER AND FACTORIAL FUNCTIONS
  let FACTORIAL_SEARCH_RESULT = search(formula, FACTORIAL);
  let POWER_SEARCH_RESULT = search(formula, POWER);
  let EULER_SEARCH_RESULT = search(formula, "Math.E");
  let PI_SEARCH = search(formula, "Math.PI");

  // UPDATES THE FORMULA_STR WITH MULTIPLICATION ADDED WHERE NECESSARY BETWEEN THE EXPRESSION
  formula_str = AddMultiplication(formula);

  // GET THE POWER BASE AND REPLACE THE FORMULA ARRAY WITH THE RIGHT FORMULA
  const BASES = getPowerBase(formula, POWER_SEARCH_RESULT);
  BASES.map((base) => {
    let toReplace = base + POWER;
    let replacement = `Math.pow(${base},`;

    formula_str = formula_str.replace(toReplace, replacement);
  });

  // GET THE FACTORIAL NUMBERS AND REPLACE THE FORMULA ARRAY WITH THE RIGHT FORMULA
  let FactorialNumbers = getFactorial(formula, FACTORIAL_SEARCH_RESULT);
  FactorialNumbers.forEach((factorial) => {
    formula_str = formula_str.replace(
      factorial.toReplace,
      factorial.replacement
    );
  });

  // GET THE EULER FUNCTION FORMULA
  let EulerSearch = getEuler(formula, EULER_SEARCH_RESULT);
  EulerSearch.forEach((euler) => {
    formula_str = formula_str.replace(euler.toReplace, euler.replacement);
  });

  // CALCULATE -> EVALUATE THE FORMULA EXPRESSION
  let result;
  try {
    result = evaluate(formula_str);
  } catch (error) {
    if (error instanceof SyntaxError) {
      result = "Syntax Error!";
      resultOutput.innerHTML = result;
      return;
    }
  }

  // SAVE RESULT FOR LATER USE
  ans = result;
  data.formula = [result];
  data.operation = [result];

  resultOutput.innerHTML = result;
  return;
};

const modeToggle = (key) => {
  if (key === "Rad") {
    RADIAN = true;
    DEGREE = false;
    RadianBtn.classList.add("active-mode");
    DegreeBtn.classList.remove("active-mode");
  } else {
    RADIAN = false;
    DEGREE = true;
    RadianBtn.classList.remove("active-mode");
    DegreeBtn.classList.add("active-mode");
  }
};

// LISTEN TO ONCLICK EVENT IN THE CALCULATOR BUTTONS AREA
buttons.addEventListener("click", (event) => {
  const { target } = event;
  let { value } = target;

  let updateSymbol;
  const buttonType = target.attributes[0].nodeValue;
  const symbol = target.textContent;

  //   IGNORE CLICK EVENT THAT ISN'T A BUTTON
  if (!target.matches("button")) {
    return;
  }

  switch (buttonType) {
    case "key":
      modeToggle(symbol);
      break;
    case "number":
      updateData(value, symbol);
      break;
    case "operator":
      updateData(value, symbol);
      break;
    case "math_function":
      if (value === "!") {
        updateSymbol = value;
        updateValue = "factorial(";
        updateData(updateValue, updateSymbol);
      } else if (value === "Math.pow(") {
        if (symbol === "𝒙²") {
          updateSymbol = `^(2)`;
          data.formula.push(value);
          updateValue = "2)";
        } else {
          updateSymbol = `^(`;
          updateValue = value;
        }
        updateData(updateValue, updateSymbol);
      } else {
        updateSymbol = `${symbol}(`;
        updateValue = `${value}(`;
        updateData(updateValue, updateSymbol);
      }
      break;
    case "trig_function":
      updateData(`trigo(${value},`, `${symbol}(`);
      break;
    case "arc_trig_function":
      updateData(`inv_trigo(${value},`, `${symbol}(`);
      break;
    case "decimal":
      updateData(value, symbol);
      break;
    case "reset":
      data.formula = [];
      data.operation = [];
      resultOutput.innerHTML = "0";
      break;
    case "clear":
      data.operation.pop();
      data.formula.pop();
      break;
    case "equalSign calculate":
      calculate();
      return;
    case "ans":
      updateData(ans, ans);
    default:
      break;
  }

  updateOutputOperation();
});

// .................................................................................................
//          MATHEMATICAL FUNCTIONS
// .................................................................................................

// SOURCE https://stackoverflow.com/questions/15454183/how-to-make-a-function-that-computes-the-factorial-for-numbers-with-decimals#answer-15454866
function gamma(n) {
  // accurate to about 15 decimal places
  //some magic constants
  var g = 7, // g represents the precision desired, p is the values of p[i] to plug into Lanczos' formula
    p = [
      0.99999999999980993,
      676.5203681218851,
      -1259.1392167224028,
      771.32342877765313,
      -176.61502916214059,
      12.507343278686905,
      -0.13857109526572012,
      9.9843695780195716e-6,
      1.5056327351493116e-7,
    ];
  if (n < 0.5) {
    return Math.PI / Math.sin(n * Math.PI) / gamma(1 - n);
  } else {
    n--;
    var x = p[0];
    for (var i = 1; i < g + 2; i++) {
      x += p[i] / (n + i);
    }
    var t = n + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x;
  }
}

// FACTORIAL FUNCTION
const factorial = (num) => {
  // GETTING THE FACTORIAL OF A DECIMAL
  // TO CHECK FOR A DECIMAL NUMBER -> A decimal number MODUL0 1 is not EQUAL ZERO
  if (num % 1 !== 0) return gamma(num + 1);

  // factorial of 1 and 0 is 1
  if (num === 0 || num === 1) return 1;

  let result = 1;
  for (let i = 1; i <= num; i++) {
    result *= i;
    if (result === Infinity) return Infinity;
  }
  return result;
};

// FACTORIAL GETTER FUNCTION
const getFactorial = (formula, FACTORIAL_SEARCH_RESULT) => {
  let factorial_sequence = 0;
  let factorial_numbers = [];

  for (let i = 0; i < FACTORIAL_SEARCH_RESULT.length; i++) {
    const index = FACTORIAL_SEARCH_RESULT[i];
    let number = []; // SAVE THE FCATORIAL NUMBERS
    let number_str; // STRINGIFY THE NUMBER ARRAY
    let bracketCount = 0; // BRACKET COUNTER

    let next_input_index = index + 1;
    let next_input = formula[next_input_index];

    // CHECK IF THE NEXT VALUE IN THE FORMULA ARRAY IS A FACTORIAL
    if (next_input === FACTORIAL) {
      factorial_sequence += 1;
      return;
    }

    // GET THE INITIAL/FIRST FACTORIAL IN THE FORMULA ARRAY
    let first_factorial_index = index - factorial_sequence;
    let prev_input_index = first_factorial_index - 1;

    while (prev_input_index >= 0) {
      //  CHECK IF VALUE IS A BRACKET OR AN OPERATOR
      if (formula[prev_input_index] === "(") bracketCount--;
      if (formula[prev_input_index] === ")") bracketCount++;
      const isOperator = OPERATORS.includes(formula[prev_input_index]);

      if (isOperator && bracketCount === 0) break;

      // ADD THE VALUE TO THE FRONT OF THE NUMBER ARRAY
      number.unshift(formula[prev_input_index]);
      prev_input_index--;
    }
    // STRINGIFY AND SAVE
    number_str = number.join("");
    let factorial = "factorial(";
    let closeBacket = ")";
    let repeatedFactorial = factorial_sequence + 1;
    let toReplace = number_str + FACTORIAL.repeat(repeatedFactorial);
    let replacement =
      factorial.repeat(repeatedFactorial) +
      number_str +
      closeBacket.repeat(repeatedFactorial);

    // PUSH THE REPLACED STRING
    factorial_numbers.push({
      toReplace,
      replacement,
    });

    // RESET THE FACTORIAL SEQUENCE
    factorial_sequence = 0;
  }
  // RETURN THE STRINGIFIED FACTORIAL STRINGS
  return factorial_numbers;
};

// BASE GETTER FUNCTION -> get the base of the power formula
const getPowerBase = (formula, POWER_SEARCH_RESULT) => {
  let powerBases = []; //  SAVE ALL THE BASES IN THE FORMULA ARRAY

  for (let i = 0; i < POWER_SEARCH_RESULT.length; i++) {
    let base = []; // CURRENT BASE
    let bracketCount = 0; // THE BRACKET COUNTER
    let index = POWER_SEARCH_RESULT[i] - 1;

    while (index >= 0) {
      // CHECK IF THE CURRENT FORMULA ARRAY VALUE IS A BRACKET
      if (formula[index] === "(") bracketCount--;
      if (formula[index] === ")") bracketCount++;

      // CHECK IF THE CURRENT FORMULA ARRAY VALUE IS AN OPERATOR OR POWER
      isOperator = OPERATORS.includes(formula[index]);
      isPower = formula[index] === POWER;

      // BREAK IF THE CONDITION IS SATISFIED
      if ((isOperator && bracketCount === 0) || isPower) break;

      // ADD THE VALUE TO THE BEGINING OF THE CURRENT BASE ARRAY
      base.unshift(formula[index]);
      index = index - 1;
    }
    // JOIN THE BASES ARRAY BACK TO STRING
    powerBases.push(base.join(""));
  }
  return powerBases;
};

// TIRGONOMETRY FUNCTION
const trigo = (callback, angle) => {
  // if the mode is set to DEGREE, convert to radian
  if (!RADIAN) {
    // CONVERT TO RADIAN
    angle = (angle * Math.PI) / 180;
  }

  // then calculate the angle in radian
  return callback(angle);
};

// INVERSE TRIGONOMETRY FUNCTION
const inv_trigo = (callback, value) => {
  // SAVE THE INPUT VALUE INTO ANGLE VARIABLE
  let angle = callback(value);

  // CHECK IF CALCULATOR IS IN RADIAN MODE OR NOT
  if (!RADIAN) {
    // CONVERT TO DEGREE
    angle = (angle * 180) / Math.PI;
  }

  // RETURN THE CALCULATED ANGLE
  return angle;
};

// EULER GETTER
const getEuler = (formula, EulerSearch) => {
  let EulerNumber = [];
  let numbers = [];

  // LOOP THROUGH THE INDEX OF THE EULER_SEARCH ARRAY
  EulerSearch.forEach((index) => {
    let bracketCount = 0;

    // GET THE NUMBER IN-FRONT OF THE EULER FUNCTION
    let next_item_index = index + 1;
    let next_item = formula[next_item_index];

    // GET THE NUMBER BEHIND THE EULER FUNCTION
    let prev_item_index = index - 1;
    let prev_item = formula[prev_item_index];

    // CHECK FOR VALID NUMBER TYPE FOR THE NEXT_ITEM
    if (parseFloat(next_item) !== NaN) {
      let nextNum = "";
      if (typeof parseFloat(next_item) === "number") {
        while (next_item_index < formula.length) {
          next_item = formula[next_item_index];

          if (formula[next_item_index] === "(") bracketCount--;
          if (formula[next_item_index] === ")") bracketCount++;

          const isOperator = OPERATORS.includes(formula[next_item_index]);
          if (isOperator && bracketCount === 0) break;

          nextNum += next_item;
          next_item_index++;
        }
      }
      numbers.push(nextNum);
    }

    // CHECK FOR VALID NUMBER TYPE FOR THE PREV_ITEM
    if (parseFloat(prev_item) !== NaN) {
      let prevNum = "";
      if (typeof parseFloat(prev_item) === "number") {
        while (prev_item_index >= 0) {
          prev_item = formula[prev_item_index];

          if (formula[prev_item_index] === "(") bracketCount--;
          if (formula[prev_item_index] === ")") bracketCount++;

          const isOperator = OPERATORS.includes(formula[prev_item_index]);
          if (isOperator && bracketCount === 0) break;

          prevNum += prev_item;
          prev_item_index--;
        }
        prevNum = reverseString(prevNum);
        console.log(prevNum);
      }
      numbers.push(prevNum);
    }

    //  THE PREV AND NEXT NUMBER VARIABLES
    let prev = "",
      next = "";

    //  SAVE THE VALUE OF THE NUMBERS
    number_str = numbers.forEach((num, i) =>
      i === 0 ? (next += num) : (prev += num)
    );

    // DECLARE THE EULAR FROM CONSTANT
    const eulerConstant = Math.E;

    let toReplace = prev + "Math.E" + next;
    let replacement =
      (prev.length === 0 ? "1" : prev) +
      "*" +
      eulerConstant +
      "*" +
      (next.length === 0 ? "1" : next);

    // PUSH THE SEARCH AND REPLACE STRINGS
    EulerNumber.push({
      toReplace,
      replacement,
    });
  });
  return EulerNumber;
};

// CHECK AND ADD * WHERE APPLICABLE FOR THE EXPRESSION
const AddMultiplication = (formula) => {
  const regEx = /Math./;
  const searchResult = searchMath(formula, regEx);
  let update;

  // LOOP THROUGH THE SEARCH RESULT ARRAY
  searchResult.forEach((index) => {
    // GET THE CURRENT VALUE
    let current_item = formula[index];
    // CHECK THE CURRENT INDEX VALUE
    if (index === 0) {
      // IGNORE MATH_POWER FUNCTIONS
      if (current_item === "Math.pow(") {
        return formula.join("");
      }
    } else {
      if (current_item === "Math.pow(") {
        return;
      }
    }

    // GET THE BEHIND VALUE
    let prev_item_index = index === 0 ? 0 : index - 1;
    let prev_item = formula[prev_item_index];

    // GET THE VALUE IN-FRONT
    let next_item_index = index + 1;
    let next_item = formula[next_item_index];

    while (next_item_index < formula.length) {
      next_item = formula[next_item_index];
      const numbers = "0123456789";

      // CHECK IF THE PREV_ITEM IS THE REQUIRED EXPRESSION AND PASSES THE TEST
      const isParams = regEx.test(next_item);

      //CHECK IF THE PREV_ITEM IS AN OPERATOR
      const isOperator = OPERATORS.includes(formula[next_item_index]);

      // ADD MULTIPLICATION *
      if (next_item === ")") {
        if (next_item_index + 1 === formula.length) {
          break;
        } else if (isOperator) {
          break;
        } else {
          formula.splice(next_item_index + 1, 0, "*");
        }
      }

      // IF IT'S AN OPERATOR OR REQUESTED PARAMETER, BREAK THE LOOP
      if (isOperator || isParams) break;
      next_item_index++;
    }

    while (prev_item_index >= 0) {
      prev_item_index === 0 ? undefined : prev_item_index;
      prev_item = formula[prev_item_index];
      const numbers = "0123456789";

      // CHECK IF THE PREV_ITEM IS THE REQUIRED EXPRESSION AND PASSES THE TEST
      const isParams = regEx.test(prev_item);

      //CHECK IF THE PREV_ITEM IS AN OPERATOR
      const isOperator = OPERATORS.includes(formula[prev_item_index]);

      // ADD MULTIPLICATION *
      if (prev_item === ")") {
        if (numbers.includes(next_item)) {
          formula.splice(index, 0, "*");
          break;
        }
      } else if (numbers.includes(prev_item)) {
        formula.splice(index, 0, "*");
      }

      // IF IT'S AN OPERATOR OR REQUESTED PARAMETER, BREAK THE LOOP
      if (isOperator || isParams) break;
      prev_item_index--;
    }
  });

  return (update = data.formula.join(""));
};

// STRING INVERSE FUNCTION
const reverseString = (string) => {
  return [...string].reverse().join("");
};

// Custom Evaluation function
const evaluate = (str) => {
  return Function(`return ${str}`)();
};
