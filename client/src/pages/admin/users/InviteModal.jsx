import React from 'react';
import { Modal } from '@mantine/core';
import PropTypes from 'prop-types';
import classes from './admin.module.css';

const inviteModalProps = {
    opened: PropTypes.bool.isRequired,
    close: PropTypes.func.isRequired,
}
export function InviteModal ({
    opened,
    close
}) {
    const title = <div><div className='title'>Single Invite</div><p>Add your documents here, and you can upload 1 file max</p></div>;
    return <Modal opened={opened} onClose={close} title={title} className={classes.modal}>ASDJFOAJSEOFJAOSEJFOAJSEOF</Modal>
}

InviteModal.propTypes = inviteModalProps;