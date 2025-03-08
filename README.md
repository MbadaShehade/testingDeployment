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
<img width="1461" alt="Screenshot 2025-03-08 at 1 59 22" src="https://github.com/user-attachments/assets/93614331-ee14-4361-a896-2518da23ab2c" />
<img width="1462" alt="Screenshot 2025-03-08 at 2 00 11" src="https://github.com/user-attachments/assets/f43d3714-ff77-4f9c-8e96-fa47acdcb6d1" />
<img width="1459" alt="Screenshot 2025-03-08 at 2 00 55" src="https://github.com/user-attachments/assets/edd08466-02b7-486f-91ac-065dd89174e4" />
<img width="1457" alt="Screenshot 2025-03-08 at 2 01 21" src="https://github.com/user-attachments/assets/422fd07a-3289-4876-8881-e219ff7ab735" />
<img width="1458" alt="Screenshot 2025-03-08 at 2 01 49" src="https://github.com/user-attachments/assets/c1babdac-60db-4dce-8d7d-cd6d773a2592" />
<img width="1454" alt="Screenshot 2025-03-08 at 2 02 43" src="https://github.com/user-attachments/assets/696a59dc-565e-48ce-af75-1c4b3fe4f874" />





---

## 📥 Installation & Setup  
-Not Yet-

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
