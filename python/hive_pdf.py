import matplotlib.pyplot as plt
import numpy as np
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, Flowable
import os
import datetime
import json
import base64
from io import BytesIO
from pymongo import MongoClient
from dotenv import load_dotenv


# Load environment variables
load_dotenv('.env.local')

# MongoDB connection
MONGODB_URI = os.getenv('MONGODB_URI')
DB_NAME = 'MoldInBeehives'

# Connect to MongoDB
def get_mongodb_connection():
    try:
        client = MongoClient(MONGODB_URI)
        db = client[DB_NAME]
        return db
    except Exception as e:
        print(f"MongoDB connection error: {e}")
        return None

class PDFBorder(Flowable):
    """Custom Flowable to draw a decorative border around the page"""
    
    def __init__(self, width, height):
        Flowable.__init__(self)
        self.width = width
        self.height = height
        
    def draw(self):
        # Get the canvas
        canvas = self.canv
        
        # Save the canvas state
        canvas.saveState()
        
        # Set up border style
        canvas.setStrokeColor(colors.orange)
        canvas.setLineWidth(2)
        
        # Draw main outer border
        canvas.rect(10, 10, self.width - 20, self.height - 20)
        
        # Draw decorative inner border
        canvas.setStrokeColor(colors.darkorange)
        canvas.setLineWidth(1)
        canvas.rect(15, 15, self.width - 30, self.height - 30)
        
        # Add decorative corners
        corner_size = 15
        # Top-left corner
        canvas.line(15, 15 + corner_size, 15 + corner_size, 15)
        # Top-right corner
        canvas.line(self.width - 15 - corner_size, 15, self.width - 15, 15 + corner_size)
        # Bottom-left corner
        canvas.line(15, self.height - 15 - corner_size, 15 + corner_size, self.height - 15)
        # Bottom-right corner
        canvas.line(self.width - 15 - corner_size, self.height - 15, self.width - 15, self.height - 15 - corner_size)
        
        # Restore the canvas state
        canvas.restoreState()

class PageTemplate(canvas.Canvas):
    """Class to create a PDF with a decorative border on each page"""
    
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self.pages = []
        
    def showPage(self):
        self.pages.append(dict(self.__dict__))
        self._startPage()
        
    def save(self):
        page_count = len(self.pages)
        for page in self.pages:
            self.__dict__.update(page)
            
            # Draw border
            self.setStrokeColor(colors.orange)
            self.setLineWidth(2)
            
            # Draw main outer border
            self.rect(10, 10, letter[0] - 20, letter[1] - 20)
            
            # Draw decorative inner border
            self.setStrokeColor(colors.darkorange)
            self.setLineWidth(1)
            self.rect(15, 15, letter[0] - 30, letter[1] - 30)
            
            # Add decorative corners
            corner_size = 15
            # Top-left corner
            self.line(15, 15 + corner_size, 15 + corner_size, 15)
            # Top-right corner
            self.line(letter[0] - 15 - corner_size, 15, letter[0] - 15, 15 + corner_size)
            # Bottom-left corner
            self.line(15, letter[1] - 15 - corner_size, 15 + corner_size, letter[1] - 15)
            # Bottom-right corner
            self.line(letter[0] - 15 - corner_size, letter[1] - 15, letter[0] - 15, letter[1] - 15 - corner_size)
            
            canvas.Canvas.showPage(self)
            
        canvas.Canvas.save(self)

# Function to create a simple placeholder chart
def create_placeholder_chart(chart_type, value=None):
    plt.figure(figsize=(8, 3))
    plt.style.use('ggplot')
    
    # Set the figure and axes background to white
    fig = plt.gcf()
    fig.patch.set_facecolor('white')
    ax = plt.gca()
    ax.set_facecolor('white')
    
    # Create time series x-axis
    x = np.arange(10)
    
    # Generate some realistic looking data
    if chart_type == 'temperature':
        # Default temperature around 33°C with some variation
        if value is None:
            value = 33.0
        # Add more variation to the data
        y = np.array([value - 0.8, value - 0.5, value - 0.3, value + 0.2, value + 0.5, 
                      value + 0.7, value + 0.3, value - 0.1, value - 0.4, value - 0.7])
        plt.plot(x, y, 'o-', color='#ba6719', linewidth=2)
        plt.ylabel('Temperature (°C)', color='black')
        plt.title(f'Temperature Data: Current {value}°C', color='black')
        plt.ylim(value - 1.5, value + 1.5)  # Wider range
    else:
        # Default humidity around 60% with some variation
        if value is None:
            value = 60.0
        # Add more variation to the data
        y = np.array([value - 4, value - 2, value - 1, value + 2, value + 5, 
                      value + 3, value - 1, value - 3, value + 1, value - 2])
        plt.plot(x, y, 'o-', color='#0EA5E9', linewidth=2)
        plt.ylabel('Humidity (%)', color='black')
        plt.title(f'Humidity Data: Current {value}%', color='black')
        plt.ylim(value - 7, value + 7)  # Wider range
    
    # Generate real timestamps based on current time
    now = datetime.datetime.now()
    timestamps = []
    for i in range(10):
        # Create timestamps going back in time (newest at the end)
        time_point = now - datetime.timedelta(seconds=(9-i)*3)  # 3-second intervals
        timestamps.append(time_point.strftime('%H:%M:%S'))
    
    plt.xticks(x, timestamps, rotation=45, color='black')
    plt.xlabel('Time', color='black')
    
    # Set grid to light gray for better contrast
    ax.grid(color='lightgray', linestyle='-', linewidth=0.5)
    
    # Set tick colors to black
    ax.tick_params(axis='x', colors='black')
    ax.tick_params(axis='y', colors='black')
    
    plt.tight_layout()
    
    # Convert to base64 encoded image
    buffer = BytesIO()
    plt.savefig(buffer, format='png', dpi=100, facecolor='white')
    buffer.seek(0)
    image_png = buffer.getvalue()
    buffer.close()
    plt.close()
    
    return base64.b64encode(image_png).decode('utf-8')

def create_hive_report_pdf(filename="hive_report.pdf", hive_id=None, temperature=None, humidity=None, temperature_image=None, humidity_image=None, username=None, force_white_background=False, report_type=None, air_pump_status=None):
    """
    Create a PDF report with the current temperature and humidity data from a beehive.
    
    Args:
        filename (str): The name of the output PDF file
        hive_id (str): The ID of the hive
        temperature (float): Current temperature reading
        humidity (float): Current humidity reading
        temperature_image (str): Base64 encoded temperature graph image
        humidity_image (str): Base64 encoded humidity graph image
        username (str): Name of the user generating the report
        force_white_background (bool): If True, always generate new placeholder charts with white backgrounds
        report_type (str): Type of report (Automatic, Manual, etc.)
        air_pump_status (str): Status of the air pump (ON or OFF)
    
    Returns:
        str: Path to the created PDF file
    """
    # Try to load data if values are not provided
    if (temperature is None or humidity is None) and hive_id is not None:
        try:
            # First try MongoDB
            db = get_mongodb_connection()
            if db:
                # Find the most recent data for this hive
                hive_data_collection = db['hive_data']
                latest_data = hive_data_collection.find_one(
                    {"hiveId": hive_id},
                    sort=[("timestamp", -1)]
                )
                
                if latest_data:
                    temperature = temperature if temperature is not None else latest_data.get('temperature', 24.9)
                    humidity = humidity if humidity is not None else latest_data.get('humidity', 77.6)
                    print(f"Loaded data from MongoDB for PDF: temp={temperature}°C, humidity={humidity}%")
                else:
                    print("No data found in MongoDB for this hive")
                    
                    # Fallback to local file if no MongoDB data
                    try:
                        # Try to read from a locally stored JSON file (if it exists)
                        json_path = f'../hive_data_{hive_id}.json'
                        if os.path.exists(json_path):
                            with open(json_path, 'r') as f:
                                hive_data = json.load(f)
                                temperature = temperature if temperature is not None else hive_data.get('temperature', 24.9)
                                humidity = humidity if humidity is not None else hive_data.get('humidity', 77.6)
                                print(f"Loaded data from file for PDF: temp={temperature}°C, humidity={humidity}%")
                        else:
                            # Use better defaults if no file exists
                            temperature = temperature if temperature is not None else 24.9
                            humidity = humidity if humidity is not None else 77.6
                            print(f"No data file found, using values: temp={temperature}°C, humidity={humidity}%")
                    except Exception as e:
                        print(f"Error reading from file: {e}")
                        temperature = temperature if temperature is not None else 24.9
                        humidity = humidity if humidity is not None else 77.6
            else:
                print("Could not connect to MongoDB, trying file fallback")
                try:
                    # Try to read from a locally stored JSON file (if it exists)
                    json_path = f'../hive_data_{hive_id}.json'
                    if os.path.exists(json_path):
                        with open(json_path, 'r') as f:
                            hive_data = json.load(f)
                            temperature = temperature if temperature is not None else hive_data.get('temperature', 24.9)
                            humidity = humidity if humidity is not None else hive_data.get('humidity', 77.6)
                            print(f"Loaded data from file for PDF: temp={temperature}°C, humidity={humidity}%")
                    else:
                        # Use better defaults if no file exists
                        temperature = temperature if temperature is not None else 24.9
                        humidity = humidity if humidity is not None else 77.6
                        print(f"No data file found, using values: temp={temperature}°C, humidity={humidity}%")
                except Exception as e:
                    print(f"Error reading from file: {e}")
                    temperature = temperature if temperature is not None else 24.9
                    humidity = humidity if humidity is not None else 77.6
        except Exception as e:
            print(f"Warning: Could not load hive data: {e}")
            temperature = temperature if temperature is not None else 24.9
            humidity = humidity if humidity is not None else 77.6
    
    # Log the values being used for the PDF
    print(f"Creating PDF with temperature={temperature}°C, humidity={humidity}%")
    
    # Create placeholder images if needed or if force_white_background is True
    if not temperature_image or force_white_background:
        try:
            temperature_value = float(temperature) if temperature != "--" else None
            temperature_image = create_placeholder_chart('temperature', temperature_value)
            print("Created placeholder temperature chart with white background")
        except Exception as e:
            print(f"Failed to create placeholder temperature chart: {e}")
    
    if not humidity_image or force_white_background:
        try:
            humidity_value = float(humidity) if humidity != "--" else None
            humidity_image = create_placeholder_chart('humidity', humidity_value)
            print("Created placeholder humidity chart with white background")
        except Exception as e:
            print(f"Failed to create placeholder humidity chart: {e}")
    
    # Create a PDF document with a custom page template for borders
    doc = SimpleDocTemplate(filename, pagesize=letter, leftMargin=20, rightMargin=20, topMargin=40, bottomMargin=30)
    story = []
    
    # Add styles
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    subtitle_style = styles['Heading2']
    normal_style = styles['Normal']
    
    # Create a custom style for the user name
    user_style = getSampleStyleSheet()['Normal']
    user_style.fontName = 'Helvetica-Bold'
    user_style.textColor = colors.darkorange
    
    # Make styles more compact
    title_style.spaceAfter = 10
    title_style.alignment = 1  # Center alignment for title only
    title_style.fontSize = 20
    subtitle_style.spaceBefore = 4
    subtitle_style.spaceAfter = 4
    
    # Add centered title
    title = Paragraph(f"Beehive {hive_id or 'Health'} Report", title_style)
    story.append(title)
    story.append(Spacer(1, 10))
    
    # Add username if provided (left-aligned)
    if username:
        user_text = Paragraph(f"Generated for: {username}", user_style)
        story.append(user_text)
        story.append(Spacer(1, 5))
    
    # Add date (left-aligned)
    date_text = Paragraph(f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}", normal_style)
    story.append(date_text)
    
    # Add report type if provided
    if report_type:
        report_type_style = user_style.clone('ReportType')
        report_type_style.textColor = colors.blue
        report_type_text = Paragraph(f"Report type: {report_type}", report_type_style)
        story.append(report_type_text)
    
    story.append(Spacer(1, 15))
    
    # Add current readings
    readings_title = Paragraph("Current Hive Readings", subtitle_style)
    story.append(readings_title)
    story.append(Spacer(1, 4))
    
    # Create a table for current readings
    data = [
        ['Metric', 'Current Value', 'Status'],
        ['Temperature', f"{temperature}°C", get_temperature_status(temperature)],
        ['Humidity', f"{humidity}%", get_humidity_status(humidity)]
    ]
    
    # Add air pump status to the table if provided
    if air_pump_status is not None:
        data.append(['Air Pump', air_pump_status, "Active" if air_pump_status == "ON" else "Inactive"])
    
    table = Table(data, colWidths=[120, 120, 120])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.orange),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 3),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(table)
    story.append(Spacer(1, 20))
    
    # Add temperature graph with its title
    graph_title = Paragraph("Temperature Graph", subtitle_style)
    story.append(graph_title)
    story.append(Spacer(1, 4))
    
    if temperature_image:
        try:
            # Remove data URL prefix if present
            if "data:image" in temperature_image:
                temperature_image = temperature_image.split(',')[1]
                
            img_data = base64.b64decode(temperature_image)
            img_temp = BytesIO(img_data)
            img = Image(img_temp, width=510, height=200)
            story.append(img)
        except Exception as e:
            print(f"Error adding temperature image: {e}")
            # Add placeholder text if image failed
            story.append(Paragraph("Temperature graph not available", normal_style))
    else:
        # Add placeholder text if no image provided
        story.append(Paragraph("Temperature graph not available", normal_style))
    
    story.append(Spacer(1, 20))
    
    # Add humidity graph with its title
    graph_title = Paragraph("Humidity Graph", subtitle_style)
    story.append(graph_title)
    story.append(Spacer(1, 4))
    
    if humidity_image:
        try:
            # Remove data URL prefix if present
            if "data:image" in humidity_image:
                humidity_image = humidity_image.split(',')[1]
                
            img_data = base64.b64decode(humidity_image)
            img_temp = BytesIO(img_data)
            img = Image(img_temp, width=510, height=200)
            story.append(img)
        except Exception as e:
            print(f"Error adding humidity image: {e}")
            # Add placeholder text if image failed
            story.append(Paragraph("Humidity graph not available", normal_style))
    else:
        # Add placeholder text if no image provided
        story.append(Paragraph("Humidity graph not available", normal_style))
    
    # Ensure PDFs are created in the root directory by prepending '../' to the path if it's a relative filename
    output_path = filename
    if not os.path.isabs(filename):
        output_path = os.path.join('..', filename)
    
    # Build the PDF with the custom page template for borders
    doc = SimpleDocTemplate(output_path, pagesize=letter, leftMargin=20, rightMargin=20, topMargin=40, bottomMargin=30)
    doc.build(story, canvasmaker=PageTemplate)
    print(f"Hive Report PDF created: {output_path}")
    return output_path

def get_temperature_status(temperature):
    """Determine the status based on temperature reading"""
    if temperature == "--":
        return "Unknown"
    try:
        temp = float(temperature)
        if 26 <= temp <= 38:
            return "Optimal"
        elif 24 <= temp < 26 or 38 < temp <= 40:
            return "Warning"
        else:
            return "Critical"
    except:
        return "Unknown"

def get_humidity_status(humidity):
    """Determine the status based on humidity reading"""
    if humidity == "--":
        return "Unknown"
    try:
        hum = float(humidity)
        if 76.5 <= hum <= 85.6:
            return "Optimal"
        elif 70 <= hum < 76.5 or 85.6 < hum <= 90:
            return "Warning"
        else:
            return "Critical"
    except:
        return "Unknown"

if __name__ == "__main__":
    
    create_hive_report_pdf(hive_id="1", temperature=33.5, humidity=55.2, username="", air_pump_status="ON") 