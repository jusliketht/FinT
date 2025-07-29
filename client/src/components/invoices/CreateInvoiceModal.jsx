import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import InvoiceForm from './InvoiceForm';

const CreateInvoiceModal = ({ isOpen, onClose, onSuccess }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Invoice</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <InvoiceForm
            onSuccess={onSuccess}
            onCancel={onClose}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CreateInvoiceModal; 