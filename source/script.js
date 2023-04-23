const FEATURES = {
  sport: (name) => new SportAuto(name),
  military: (name) => new MilitaryAuto(name),
  civil: (name) => new CivilAuto(name),
};
const TYPES = ["sport", "military", "civil"];

const FEATURES_DICT = {
  Fuel: "fuel",
  "Low fuel consumption": "lowFuelConsumption",
  Durability: "durability",
  Speed: "speed",
};

const DEFAULT_FUEL = 5;
const OPPONENTS_NUMBER = 4;

class DefaultAuto {
  fuel = 0;
  lowFuelConsumption = 0;
  durability = 0;
  speed = 0;
  constructor(name = "Unknown Car") {
    this.name = name;
  }
}

class SportAuto extends DefaultAuto {
  fuel = 2;
  lowFuelConsumption = 1;
  durability = 1;
  speed = 6;
}

class MilitaryAuto extends DefaultAuto {
  fuel = 2;
  lowFuelConsumption = 2;
  durability = 4;
  speed = 2;
}

class CivilAuto extends DefaultAuto {
  fuel = 2;
  lowFuelConsumption = 2;
  durability = 2;
  speed = 4;
}

class App {
  myAutoObj = {};
  allOpponents = [];
  static resetButton = document.getElementById("1");
  static compareButton = document.getElementById("2");
  static findOpponentsButton = document.getElementById("3");
  static plusButtons = document.querySelectorAll(".plus");

  constructor() {
    this.init();
  }

  init = () => {
    App.resetButton.disabled = true;
    App.compareButton.disabled = true;
    App.findOpponentsButton.disabled = true;
    userCar.createUsersDefaultCar();

    for (let index = 0; index < App.plusButtons.length; index++) {
      App.plusButtons[index].addEventListener("click", () => {
        this.myAutoObj = userCar.upgradeSomeTwoFeatures(index);
      });
    }

    App.findOpponentsButton.addEventListener("click", () => {
      this.allOpponents = enemyCars.findOpponents();
      App.compareButton.disabled = false;
    });

    App.compareButton.addEventListener("click", () => {
      const cars = this.compare();
      this.printFeatures(cars);
      App.resetButton.disabled = false;
      App.compareButton.disabled = true;
      App.findOpponentsButton.disabled = true;
    });
    App.resetButton.addEventListener("click", () => {
      this.resetGame();
      enemyCars.state = [];
      App.resetButton.disabled = true;
    });
  };

  printFeatures(cars) {
    const compareTable = document.querySelector("#compareTable tbody");
    let htmlStr = ``;
    for (const { name, powerReserve, durability, speed } of cars) {
      htmlStr += `
        <tr>
          <td>${name}</td>
          <td>${powerReserve}</td>
          <td>${durability}</td>
          <td>${speed}</td>
        </tr>
      `;
    }
    compareTable.insertAdjacentHTML("afterbegin", htmlStr);
  }

  compare = () => {
    const getTotalSpeed = (speed) => {
      const totalSpeed = 10 + speed * 0.05 * 10;
      return totalSpeed;
    };

    const getTotalDurability = (durability) => {
      const totalDurability = 100 + durability * 0.1 * 100;
      return totalDurability;
    };

    const getTotalPowerReserve = (fuel, lowFuelConsumption) => {
      const totalFuel = DEFAULT_FUEL + fuel;
      const totalPowerReserve =
        totalFuel * 200 + totalFuel * 0.1 * 200 * lowFuelConsumption;
      return totalPowerReserve;
    };

    const getTotalFeatures = () => {
      const allAutos = [this.myAutoObj, ...this.allOpponents];
      const totalFeatures = allAutos.map(
        ({ fuel, lowFuelConsumption, durability, speed, name }) => {
          return {
            totalPowerReserve: getTotalPowerReserve(fuel, lowFuelConsumption),
            totalDurability: getTotalDurability(durability),
            totalSpeed: getTotalSpeed(speed),
            name,
          };
        }
      );

      return totalFeatures;
    };

    const getMaxFeatures = (func) => {
      const newArr = func();
      const maxtotalPowerReserve = Math.max(
        ...newArr.map((el) => el.totalPowerReserve)
      );
      const maxTotalDurability = Math.max(
        ...newArr.map((el) => el.totalDurability)
      );
      const maxTotalSpeed = Math.max(...newArr.map((el) => el.totalSpeed));

      return {
        maxtotalPowerReserve,
        maxTotalDurability,
        maxTotalSpeed,
      };
    };

    const maxFeatures = getMaxFeatures(getTotalFeatures);
    const arr1 = getTotalFeatures();
    const rel = arr1.map(
      ({ totalPowerReserve, totalDurability, totalSpeed, name }) => {
        return {
          powerReserve: `${Math.round(
            (totalPowerReserve / maxFeatures.maxtotalPowerReserve) * 100
          )}%`,
          durability: `${Math.round(
            (totalDurability / maxFeatures.maxTotalDurability) * 100
          )}%`,
          speed: `${Math.round(
            (totalSpeed / maxFeatures.maxTotalSpeed) * 100
          )}%`,
          name,
        };
      }
    );
    return rel;
  };

  resetGame() {
    const tableBody = document.querySelector("tbody");
    for (let index = 0; index < userCar.featuresValues.length; index++) {
      userCar.featuresValues[index].children[0].textContent = 0;
    }
    userCar.chooseAutoTitle.textContent = "";
    enemyCars.opponents.innerHTML = "";
    if (tableBody.children) {
      tableBody.replaceChildren();
    }
  }
}

class User {
  state = {};
  sum = 0;
  featuresValues = document.querySelectorAll(".features__name");
  featureItem = document.querySelectorAll(".features__item");
  chooseAutoTitle = document.querySelector(".chosen-car__title").children[0];

  clearState() {
    this.state = null;
  }

  upgradeSomeTwoFeatures(index) {
    if (this.sum === 0) {
      this.chooseAutoTitle.textContent = "Вы не выбрали авто";
    } else if (this.sum > 0 && this.sum < 12) {
      let feature = this.featuresValues[index];
      let featureValue = feature.children[0];
      let featureName = feature.textContent.split(":")[0];
      this.sum += 1;
      this.state[FEATURES_DICT[featureName]] += 1;
      featureValue.textContent = (+featureValue.textContent + 1).toString();
    } else {
      App.findOpponentsButton.disabled = false;
      const p = document.createElement("p");
      p.textContent = "Превышен лимит распределяемых очков.";
      p.classList.add("warning");
      this.featureItem[index].appendChild(p);
      setTimeout(() => {
        p.remove();
      }, 1000);
    }
    return this.state;
  }

  createUsersDefaultCar() {
    const carList = document.querySelector(".cars__list");
    carList.addEventListener("click", (e) => {
      this.chooseUsersDefaultCar(e);
      for (let index = 0; index < this.featuresValues.length; index++) {
        this.featuresValues[index].children[0].textContent = Object.values(
          this.state
        )[index];
      }
      this.chooseAutoTitle.textContent = e.target.textContent;
    });
  }

  chooseUsersDefaultCar(e) {
    let carLink = e.target;
    if (carLink.tagName != "A") return;
    this.clearState();
    let carType = carLink.textContent.split(" ")[0];
    carType = carType[0].toLowerCase() + carType.slice(1);
    this.state = FEATURES[carType]("My car");
    this.sum = 10;
  }
}

class Utils {
  static getRandomNum(max) {
    return Math.floor(Math.random() * max);
  }

  static getTwoRandomNum() {
    return [this.getRandomNum(4), this.getRandomNum(4)];
  }
}

class Opponents {
  opponents = document.querySelector(".opponents");
  state = [];

  findOpponents = () => {
    for (let index = 0; index < OPPONENTS_NUMBER; index++) {
      const randomNum = Utils.getRandomNum(3);
      const defaultAuto = FEATURES[TYPES[randomNum]](`Enemy car ${index + 1}`);
      let map = Object.entries(defaultAuto);
      const mas = Utils.getTwoRandomNum();
      for (let i = 0; i < mas.length; i++) {
        map = map.map(([key, value], j) =>
          j == mas[i] ? [key, (value += 1)] : [key, value]
        );
      }
      const newAuto = Object.fromEntries(map);
      this.state.push(newAuto);
      this.opponents.innerHTML += this.createOpponents(newAuto);
    }
    return this.state;
  };

  createOpponents({ fuel, lowFuelConsumption, durability, speed, name }) {
    return `
    <div class="opponent-car opponent-car__features features">
      <ul class="features__list">
        <li>
          <p class="features__name">Fuel:<span>${fuel}</span></p>
        </li>
        <li>
          <p class="features__name">LFC:<span>${lowFuelConsumption}</span></p>
        </li>
        <li>
          <p class="features__name">Durability:<span>${durability}</span></p>
        </li>
        <li>
          <p class="features__name">Speed:<span>${speed}</span></p>
        </li>
        <li>
          <p class="features__name">Name:<span>${name}</span></p>
        </li>
      </ul>
    </div>`;
  }
}

const userCar = new User();
const enemyCars = new Opponents();
new App();
