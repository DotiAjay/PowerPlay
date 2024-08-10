import React, { Component } from 'react';
import moment from 'moment-timezone';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './index.css'

class TimeZoneDisplay extends Component {
  render() {
    const { timeZone, currentTime, onDelete } = this.props;
    const localTime = currentTime.tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
    
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '8px', 
        border: '1px solid #ccc', 
        borderRadius: '4px', 
        marginBottom: '8px' 
      }}>
        <div>
          <strong>{timeZone}</strong>: {localTime}
        </div>
        <button onClick={onDelete} style={{ marginLeft: '10px' }}>
          Delete
        </button>
      </div>
    );
  }
}

class TimeZoneConverter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeZones: ['UTC', 'Asia/Kolkata'], // Default time zones
      currentTime: moment(),
      selectedDate: new Date(),
      darkMode: false,
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState({ currentTime: moment() });
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  handleTimeZoneAddition = (timeZone) => {
    this.setState(prevState => ({
      timeZones: [...prevState.timeZones, timeZone]
    }));
  };

  handleTimeZoneDeletion = (index) => {
    this.setState(prevState => ({
      timeZones: prevState.timeZones.filter((_, i) => i !== index)
    }));
  };

  onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(this.state.timeZones);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    this.setState({ timeZones: items });
  };

  handleDateChange = (date) => {
    this.setState({ selectedDate: date });
  };

  reverseOrder = () => {
    this.setState(prevState => ({
      timeZones: prevState.timeZones.reverse()
    }));
  };

  toggleDarkMode = () => {
    this.setState(prevState => ({ darkMode: !prevState.darkMode }));
  };

  generateShareableLink = () => {
    const { timeZones, selectedDate } = this.state;
    const url = `${window.location.origin}?timeZones=${timeZones.join(',')}&date=${selectedDate.toISOString()}`;
    alert(`Shareable link: ${url}`);
  };

  scheduleMeet = () => {
    const { selectedDate, currentTime } = this.state;
    const startDateTime = selectedDate ? moment(selectedDate) : currentTime;
    const googleCalendarUrl = `https://calendar.google.com/calendar/r/eventedit?dates=${startDateTime.format('YYYYMMDDTHHmm00Z')}/${startDateTime.clone().add(1, 'hour').format('YYYYMMDDTHHmm00Z')}&text=Meeting`;
    window.open(googleCalendarUrl, '_blank');
  };

  render() {
    const { timeZones, currentTime, selectedDate, darkMode } = this.state;

    return (
      <div className={darkMode ? 'dark-mode' : 'light-mode'}>
        <h1>Time Zone Converter</h1>

        <DatePicker
          selected={selectedDate}
          onChange={this.handleDateChange}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="MMMM d, yyyy h:mm aa"
          timeCaption="Time"
        />

        <button onClick={this.reverseOrder}>Reverse Order</button>
        <button onClick={this.toggleDarkMode}>
          Toggle {darkMode ? 'Light' : 'Dark'} Mode
        </button>
        <button onClick={this.generateShareableLink}>Generate Shareable Link</button>
        <button onClick={this.scheduleMeet}>Schedule Meet</button>

        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {timeZones.map((zone, index) => (
                  <Draggable key={zone} draggableId={zone} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TimeZoneDisplay
                          timeZone={zone}
                          currentTime={currentTime}
                          onDelete={() => this.handleTimeZoneDeletion(index)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    );
  }
}

export default TimeZoneConverter;
