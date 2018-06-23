import React, { Component } from 'react';
import { Radio, Form, DatePicker } from 'antd';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

class DashboardSearchForm extends Component {

    render() {
        const {handleCalendarChange, handleRangePickerChange, dateRange} = this.props;
        const { getFieldDecorator } = this.props.form;

        const formItemLayout = null;

        return (
            <Form layout="inline">
                <FormItem {...formItemLayout}>
                    {getFieldDecorator('dateRadioButton', {initialValue: '1day'})(
                        <Radio.Group onChange={ handleCalendarChange.bind(this, this.props.form) }>
                            {Object.keys(dateRange).map((item)=>
                                    <Radio.Button style={{padding: '0 8px'}} value={item}>{dateRange[item].text}</Radio.Button>
                            )}
                        </Radio.Group>
                    )}
                </FormItem>
                <FormItem {...formItemLayout}>
                    {getFieldDecorator('rangeDatePicker',{initialValue: dateRange['1day'].values})(
                        <RangePicker size="normal" placeholder={['date start', 'date end']}
                                     onChange={handleRangePickerChange.bind(this, this.props.form)}/>
                    )}
                </FormItem>
            </Form>
        );
    }
}

export default Form.create()(DashboardSearchForm);