import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import BillForm from './BillForm';

const CreateBillModal = ({ isOpen, onClose, onSuccess }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Bill</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <BillForm
            onSuccess={onSuccess}
            onCancel={onClose}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CreateBillModal; 