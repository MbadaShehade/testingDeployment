# 🐝 Prevention of Mold in Beehives

## 📌 Project Overview  
Mold growth in beehives is a major concern for beekeepers, impacting colony health, reducing honey production, and leading to potential colony collapse. This project presents an **IoT-based system** that integrates **sensors and machine learning** to monitor and regulate hive conditions, preventing mold formation.

---

## 🚀 Features  
✅ **Real-time Monitoring**: Tracks temperature and humidity inside the beehive.  
✅ **Automated Alerts**: Sends notifications when conditions favor mold growth.  
✅ **Data Visualization**: Displays real-time and historical data using interactive charts.  
✅ **Machine Learning Insights**: Predicts mold risks and provides actionable recommendations.  
✅ **Remote Access**: Cloud-based storage ensures data accessibility from anywhere.  

---

## 🛠️ Tech Stack  
### Backend:  
- ![Python](https://img.shields.io/badge/Python-3.9-blue) (Data processing & ML algorithms)  
- ![MongoDB](https://img.shields.io/badge/Database-MongoDB-green) (Sensor data storage)  

### Frontend:  
- ![Next.js](https://img.shields.io/badge/Frontend-Next.js-black) (User interface)  
- ![CSS](https://img.shields.io/badge/Styling-CSS-blue)  
- ![Chart.js](https://img.shields.io/badge/Visualization-Chart.js-red) (Data visualization)  

### IoT & Communication:  
- **MQTT Protocol** (Real-time data transmission)  
- **LoRa868 & Wi-Fi** (Data communication)  

---

## 🎯 System Architecture  
```
[ Sensors ] → [ M5Stack ] → [ LoRa868 ] → [ Cloud Storage (MongoDB) ] → [ Web Dashboard ]
```
1. **Sensors** (Temperature & Humidity) collect data from the hive.  
2. **Data Transmission** via MQTT using LoRa868 to a central device (M5Stack).  
3. **Cloud Storage** (MongoDB) for long-term data retention.  
4. **User Dashboard** displays graphs & alerts using Next.js.  
5. **ML Model** predicts mold risk based on collected data.  

---

## 📸 Screenshots  
<img width="1451" alt="Screenshot 2025-03-07 at 16 42 33" src="https://github.com/user-attachments/assets/0df9442d-4c74-487f-ab3d-229af8036b5e" />
<img width="1320" alt="Screenshot 2025-03-07 at 16 42 52" src="https://github.com/user-attachments/assets/74899e13-532f-42c2-9e4c-1c0500b5ea65" />
<img width="593" alt="Screenshot 2025-03-07 at 16 43 13" src="https://github.com/user-attachments/assets/b187b3c4-9fc2-4162-9871-f328416823af" />
<img width="510" alt="Screenshot 2025-03-07 at 16 43 24" src="https://github.com/user-attachments/assets/fcf161eb-ac8b-49a5-b767-7023e668c6b4" />


---

## 📥 Installation & Setup  
### 1️⃣ Clone the repository:  
```bash
 git clone https://github.com/MbadaShehade/Prevention-of-mold-in-beehives.git
 cd Prevention-of-mold-in-beehives
```

### 2️⃣ Install backend dependencies:  
```bash
 pip install -r requirements.txt
```

### 3️⃣ Install frontend dependencies:  
```bash
 cd frontend  
 npm install  
 npm run dev  
```

### 4️⃣ Set up MQTT broker & LoRa868 connectivity.  
### 5️⃣ Connect the sensors and ensure data transmission is active.  

---

## 🧪 Testing  
The system is tested for:  
- ✅ **Data accuracy** (temperature & humidity readings)  
- ✅ **Response time** (sensor-to-dashboard updates)  
- ✅ **ML predictions** (mold risk detection)  
- ✅ **UI functionality** (dashboard & alerts)  

---

## 📌 Future Enhancements  
🚀 Expand ML capabilities for more accurate predictions.  
📱 Implement mobile app support.  
🔋 Improve power efficiency using adaptive energy management.  

---

## 🏆 Contributors  
- **Tamer Amer**  
- **Mbada Shehady**  

---

## 📝 License  
This project is licensed under the **MIT License**.  
